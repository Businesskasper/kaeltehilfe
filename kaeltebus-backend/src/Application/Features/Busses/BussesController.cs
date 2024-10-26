using AutoMapper;
using FluentValidation;
using kaeltebus_backend.Infrastructure.Database;
using kaeltebus_backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.EntityFrameworkCore;

namespace kaeltebus_backend.Features.Busses;

[Route("/api/[controller]")]
public class BussesController : ControllerBase
{
    protected readonly ILogger<BussesController> _logger;
    protected readonly KbContext _kbContext;
    protected readonly IMapper _mapper;

    public BussesController(ILogger<BussesController> logger, KbContext kbContext, IMapper mapper)
    {
        _logger = logger;
        _kbContext = kbContext;
        _mapper = mapper;
    }

    [HttpGet()]
    [Authorize(Roles = "ADMIN,OPERATOR")]
    public async Task<IEnumerable<BusDto>> Query()
    {
        var tokenDetails = User.Claims.GetTokenDetails();

        var objs = await _kbContext.Busses.Where(x => !x.IsDeleted).ToListAsync();
        var dtos = _mapper.Map<List<BusDto>>(objs);

        return dtos;
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "ADMIN,OPERATOR")]
    public async Task<ActionResult<BusDto>> Get([FromRoute(Name = "id")] int id)
    {
        var obj = await _kbContext.Busses.FirstOrDefaultAsync(x => x.Id == id);
        return obj != null ? _mapper.Map<BusDto>(obj) : NotFound();
    }

    [HttpPost()]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> Create([FromBody()] BusCreateDto dto)
    {
        var obj = _mapper.Map<Bus>(dto);
        var result = _kbContext.Busses.Attach(obj);
        await _kbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), routeValues: new { id = result.Entity.Id }, null);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<ActionResult> Put(
        [FromRoute(Name = "id")] int id,
        [FromBody(EmptyBodyBehavior = EmptyBodyBehavior.Allow)] BusCreateDto dto
    )
    {
        var existing = await _kbContext.Busses.FindAsync(id);
        if (existing is null)
            return NotFound();

        // var updatedEntity = _mapper.Map(dto, existing);
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
        var obj = await _kbContext.Busses.FindAsync(id);
        if (obj == null)
            return NotFound();

        obj.IsDeleted = true;
        await _kbContext.SaveChangesAsync();

        return NoContent();
    }
}
