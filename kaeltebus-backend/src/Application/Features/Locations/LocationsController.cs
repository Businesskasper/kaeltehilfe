using AutoMapper;
using FluentValidation;
using kaeltebus_backend.Infrastructure.Database;
using kaeltebus_backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.EntityFrameworkCore;

namespace kaeltebus_backend.Features.Locations;

[Route("/api/[controller]")]
public class LocationsController : ControllerBase
{
    protected readonly ILogger<LocationsController> _logger;
    protected readonly KbContext _kbContext;
    protected readonly IMapper _mapper;

    public LocationsController(
        ILogger<LocationsController> logger,
        KbContext kbContext,
        IMapper mapper
    )
    {
        _logger = logger;
        _kbContext = kbContext;
        _mapper = mapper;
    }

    [HttpGet()]
    [Authorize(Roles = "ADMIN,OPERATOR")]
    public async Task<IEnumerable<LocationDto>> Query()
    {
        var objs = await _kbContext.Locations.Where(x => !x.IsDeleted).ToListAsync();
        var dtos = _mapper.Map<List<LocationDto>>(objs);

        return dtos;
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "ADMIN,OPERATOR")]
    public async Task<ActionResult<LocationDto>> Get([FromRoute(Name = "id")] int id)
    {
        var obj = await _kbContext.Locations.FirstOrDefaultAsync(x => x.Id == id);
        return obj != null ? _mapper.Map<LocationDto>(obj) : NotFound();
    }

    [HttpPost()]
    [Authorize(Roles = "ADMIN,OPERATOR")]
    public async Task<IActionResult> Create([FromBody()] LocationCreateDto dto)
    {
        var obj = _mapper.Map<Location>(dto);
        var result = _kbContext.Locations.Attach(obj);
        await _kbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), routeValues: new { id = result.Entity.Id }, null);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<ActionResult> Put(
        [FromRoute(Name = "id")] int id,
        [FromBody(EmptyBodyBehavior = EmptyBodyBehavior.Allow)] LocationCreateDto dto
    )
    {
        var existing = await _kbContext.Locations.FindAsync(id);
        if (existing is null)
            return NotFound();

        // var updatedEntity = _mapper.Map(dto, existing);
        var updatedEntity = _mapper.Map<Location>(dto);
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
        var obj = await _kbContext.Locations.FindAsync(id);
        if (obj == null)
            return NotFound();

        obj.IsDeleted = true;
        await _kbContext.SaveChangesAsync();

        return NoContent();
    }
}
