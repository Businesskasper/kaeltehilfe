using AutoMapper;
using FluentValidation;
using kaeltebus_backend.Infrastructure.Database;
using kaeltebus_backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.EntityFrameworkCore;

namespace kaeltebus_backend.Features.Shifts;

[Route("/api/[controller]")]
public class ShiftsController : ControllerBase
{
    private readonly ILogger<ShiftsController> _logger;
    private readonly KbContext _kbContext;
    private readonly IMapper _mapper;

    public ShiftsController(ILogger<ShiftsController> logger, KbContext kbContext, IMapper mapper)
    {
        _logger = logger;
        _kbContext = kbContext;
        _mapper = mapper;
    }

    [HttpGet()]
    [Authorize(Roles = "ADMIN")]
    public async Task<IEnumerable<ShiftDto>> Query()
    {
        var objs = await _kbContext
            .Shifts.Where(x => !x.IsDeleted)
            .Include(s => s.Bus)
            .Include(s => s.ShiftVolunteers)
            .ThenInclude(sv => sv.Volunteer)
            .ToListAsync();
        var dtos = _mapper.Map<List<ShiftDto>>(objs ?? []);

        return dtos;
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<ActionResult<ShiftDto>> Get([FromRoute(Name = "id")] int id)
    {
        var obj = await _kbContext
            .Shifts.Include(s => s.Bus)
            .Include(s => s.ShiftVolunteers)
            .ThenInclude(sv => sv.Volunteer)
            .FirstOrDefaultAsync(s => s.Id == id);
        return obj != null ? _mapper.Map<ShiftDto>(obj) : NotFound();
    }

    [HttpPost()]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> Create([FromBody()] ShiftCreateDto dto)
    {
        var obj = _mapper.Map<Shift>(dto);
        var volunteers = await _kbContext
            .Volunteers.Where(x => !x.IsDeleted && dto.Volunteers.Select(x => x.Id).Contains(x.Id))
            .ToDictionaryAsync(x => x.Id);
        obj.ShiftVolunteers = dto.Volunteers.ToShiftVolunteers(volunteers);

        var bus =
            await _kbContext.Busses.FindAsync(dto.BusId)
            ?? throw this.GetModelStateError("busId", "Bus not found");
        obj.Bus = bus;

        var result = await _kbContext.Shifts.AddAsync(obj);
        await _kbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), routeValues: new { id = result.Entity.Id }, null);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<ActionResult> Put(
        [FromRoute(Name = "id")] int id,
        [FromBody(EmptyBodyBehavior = EmptyBodyBehavior.Allow)] ShiftCreateDto dto
    )
    {
        var existing = await _kbContext
            .Shifts.Include(s => s.Bus)
            .Include(s => s.ShiftVolunteers)
            .ThenInclude(sv => sv.Volunteer)
            .FirstOrDefaultAsync(s => s.Id == id);
        if (existing is null)
            return NotFound();

        var receivedObj = _mapper.Map<Shift>(dto);
        existing.Date = receivedObj.Date;
        existing.IsDeleted = receivedObj.IsDeleted;

        existing.ShiftVolunteers.Clear();
        var volunteers = await _kbContext
            .Volunteers.Where(x => !x.IsDeleted && dto.Volunteers.Select(x => x.Id).Contains(x.Id))
            .ToDictionaryAsync(x => x.Id);
        existing.ShiftVolunteers = dto.Volunteers.ToShiftVolunteers(volunteers);

        if (existing.BusId != receivedObj.BusId)
        {
            var bus =
                await _kbContext.Busses.FindAsync(receivedObj.BusId)
                ?? throw this.GetModelStateError("BusId", "Bus not found");
            existing.Bus = bus;
            existing.BusId = receivedObj.BusId;
        }

        _kbContext.Shifts.Update(existing);
        await _kbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<ActionResult> Delete([FromRoute(Name = "id")] int id)
    {
        var obj = await _kbContext.Shifts.FindAsync(id);
        if (obj == null)
            return NotFound();

        obj.IsDeleted = true;
        await _kbContext.SaveChangesAsync();

        return NoContent();
    }
}

static class ShiftsExtensions
{
    public static List<ShiftVolunteer> ToShiftVolunteers(
        this List<ShiftCreateVolunteerDto> submittedVolunteers,
        Dictionary<int, Volunteer> resolvedVolunteers
    )
    {
        return submittedVolunteers
            .Select(
                (submittedVolunteer, index) =>
                {
                    var volunteerEntry = resolvedVolunteers[submittedVolunteer.Id];
                    if (volunteerEntry == null)
                    {
                        var modelState = new ModelStateDictionary();
                        modelState.AddModelError(
                            "Volunteers",
                            $"Volunteer ${submittedVolunteer.Id} was not found"
                        );
                        throw new InvalidModelStateException(modelState);
                    }
                    return new ShiftVolunteer { Order = index, Volunteer = volunteerEntry };
                }
            )
            .ToList();
    }
}
