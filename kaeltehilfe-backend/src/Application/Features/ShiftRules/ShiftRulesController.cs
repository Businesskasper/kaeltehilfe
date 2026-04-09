using AutoMapper;
using kaeltehilfe_backend.Infrastructure.Database;
using kaeltehilfe_backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace kaeltehilfe_backend.Features.ShiftRules;

[Route("/api/shift-rules")]
public class ShiftRulesController : ControllerBase
{
    private readonly ILogger<ShiftRulesController> _logger;
    private readonly KbContext _kbContext;
    private readonly IMapper _mapper;

    public ShiftRulesController(ILogger<ShiftRulesController> logger, KbContext kbContext, IMapper mapper)
    {
        _logger = logger;
        _kbContext = kbContext;
        _mapper = mapper;
    }

    [HttpGet()]
    [Authorize(Roles = "ADMIN")]
    public async Task<IEnumerable<ShiftRuleDto>> Query()
    {
        var objs = await _kbContext.ShiftRules
            .Where(x => !x.IsDeleted)
            .Include(x => x.Bus)
            .ToListAsync();
        return _mapper.Map<List<ShiftRuleDto>>(objs);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<ActionResult<ShiftRuleDto>> Get([FromRoute(Name = "id")] int id)
    {
        var obj = await _kbContext.ShiftRules
            .Include(x => x.Bus)
            .FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted);
        return obj != null ? _mapper.Map<ShiftRuleDto>(obj) : NotFound();
    }

    [HttpPost()]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> Create([FromBody] ShiftRuleCreateDto dto)
    {
        var obj = _mapper.Map<ShiftRule>(dto);

        if (dto.BusId.HasValue)
        {
            var bus = await _kbContext.Busses.FirstOrDefaultAsync(b => b.Id == dto.BusId && !b.IsDeleted);
            if (bus is null)
                return BadRequest("Bus not found");
            obj.Bus = bus;
        }

        var result = _kbContext.ShiftRules.Attach(obj);
        await _kbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), routeValues: new { id = result.Entity.Id }, null);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<ActionResult> Put(
        [FromRoute(Name = "id")] int id,
        [FromBody] ShiftRuleCreateDto dto
    )
    {
        var existing = await _kbContext.ShiftRules
            .Include(x => x.Bus)
            .FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted);
        if (existing is null)
            return NotFound();

        existing.Criterion = Enum.Parse<VolunteerCriterion>(dto.Criterion!);
        existing.Threshold = dto.Threshold;
        existing.IsActive = dto.IsActive;

        if (dto.BusId != existing.BusId)
        {
            if (dto.BusId.HasValue)
            {
                var bus = await _kbContext.Busses.FirstOrDefaultAsync(b => b.Id == dto.BusId && !b.IsDeleted);
                if (bus is null)
                    return BadRequest("Bus not found");
                existing.Bus = bus;
                existing.BusId = dto.BusId;
            }
            else
            {
                existing.Bus = null;
                existing.BusId = null;
            }
        }

        await _kbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<ActionResult> Delete([FromRoute(Name = "id")] int id)
    {
        var obj = await _kbContext.ShiftRules.FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted);
        if (obj == null)
            return NotFound();

        obj.IsDeleted = true;
        await _kbContext.SaveChangesAsync();

        return NoContent();
    }
}
