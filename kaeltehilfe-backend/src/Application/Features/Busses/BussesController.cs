using AutoMapper;
using kaeltehilfe_backend.Infrastructure.Database;
using kaeltehilfe_backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.EntityFrameworkCore;

namespace kaeltehilfe_backend.Features.Busses;

[Route("/api/[controller]")]
public class BussesController : ControllerBase
{
    private readonly ILogger<BussesController> _logger;
    private readonly KbContext _kbContext;
    private readonly IMapper _mapper;
    private readonly IBusService _busService;

    public BussesController(
        ILogger<BussesController> logger,
        KbContext kbContext,
        IMapper mapper,
        IBusService busService
    )
    {
        _logger = logger;
        _kbContext = kbContext;
        _mapper = mapper;
        _busService = busService;
    }

    [HttpGet()]
    [Authorize(Roles = "ADMIN,OPERATOR")]
    public async Task<IEnumerable<BusDto>> Query()
    {
        var objs = await _kbContext.Busses.Where(x => !x.IsDeleted).ToListAsync();
        return _mapper.Map<List<BusDto>>(objs);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "ADMIN,OPERATOR")]
    public async Task<ActionResult<BusDto>> Get([FromRoute(Name = "id")] int id)
    {
        var obj = await _kbContext.Busses.FirstOrDefaultAsync(b => b.Id == id && !b.IsDeleted);
        return obj != null ? _mapper.Map<BusDto>(obj) : NotFound();
    }

    [HttpPost()]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> Create([FromBody] BusCreateDto dto)
    {
        var existing = await _kbContext.Busses.FirstOrDefaultAsync(b =>
            b.RegistrationNumber == dto.RegistrationNumber && !b.IsDeleted
        );
        if (existing is not null)
            throw this.GetModelStateError(
                "registrationNumber",
                $"A bus with registration number {dto.RegistrationNumber} already exists"
            );

        _logger.LogInformation("Creating bus {RegistrationNumber}", dto.RegistrationNumber);
        var bus = await _busService.CreateBusWithLogin(dto.RegistrationNumber);
        await _kbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), routeValues: new { id = bus.Id }, null);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<ActionResult> Put(
        [FromRoute(Name = "id")] int id,
        [FromBody(EmptyBodyBehavior = EmptyBodyBehavior.Allow)] BusCreateDto dto
    )
    {
        var existing = await _kbContext.Busses.FirstOrDefaultAsync(b => b.Id == id && !b.IsDeleted);
        if (existing is null)
            return NotFound();

        var updatedEntity = _mapper.Map<Bus>(dto);
        updatedEntity.Id = existing.Id;
        updatedEntity.AddOn = existing.AddOn;

        _kbContext.Entry(existing).CurrentValues.SetValues(updatedEntity);
        await _kbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<ActionResult> Delete([FromRoute(Name = "id")] int id)
    {
        var obj = await _kbContext.Busses.FirstOrDefaultAsync(b => b.Id == id && !b.IsDeleted);
        if (obj is null)
            return NotFound();

        _logger.LogInformation("Deleting bus {RegistrationNumber}", obj.RegistrationNumber);
        await _busService.DeleteBusWithLogin(obj);
        await _kbContext.SaveChangesAsync();

        return NoContent();
    }
}
