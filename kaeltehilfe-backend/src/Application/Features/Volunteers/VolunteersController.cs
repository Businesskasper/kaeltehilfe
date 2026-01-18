using AutoMapper;
using FluentValidation;
using kaeltehilfe_backend.Infrastructure.Database;
using kaeltehilfe_backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.EntityFrameworkCore;

namespace kaeltehilfe_backend.Features.Volunteers;

[Route("/api/[controller]")]
public class VolunteersController : ControllerBase
{
    protected readonly ILogger<VolunteersController> _logger;
    protected readonly KbContext _kbContext;
    protected readonly IMapper _mapper;

    public VolunteersController(
        ILogger<VolunteersController> logger,
        KbContext kbContext,
        IMapper mapper
    )
    {
        _logger = logger;
        _kbContext = kbContext;
        _mapper = mapper;
    }

    [HttpGet()]
    [Authorize(Roles = "ADMIN")]
    public async Task<IEnumerable<VolunteerDto>> Query()
    {
        var objs = await _kbContext.Volunteers.Where(x => !x.IsDeleted).ToListAsync();
        var dtos = _mapper.Map<List<VolunteerDto>>(objs);

        return dtos;
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<ActionResult<VolunteerDto>> Get([FromRoute(Name = "id")] int id)
    {
        var obj = await _kbContext.Volunteers.FirstOrDefaultAsync(v => v.Id == id && !v.IsDeleted);
        return obj != null ? _mapper.Map<VolunteerDto>(obj) : NotFound();
    }

    [HttpPost()]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> Create([FromBody()] VolunteerCreateDto dto)
    {
        var obj = _mapper.Map<Volunteer>(dto);
        var result = _kbContext.Volunteers.Attach(obj);
        await _kbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), routeValues: new { id = result.Entity.Id }, null);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<ActionResult> Put(
        [FromRoute(Name = "id")] int id,
        [FromBody(EmptyBodyBehavior = EmptyBodyBehavior.Allow)] VolunteerCreateDto dto
    )
    {
        var existing = await _kbContext.Volunteers.FirstOrDefaultAsync(v =>
            v.Id == id && !v.IsDeleted
        );
        if (existing is null)
            return NotFound();

        // var updatedEntity = _mapper.Map(dto, existing);
        var updatedEntity = _mapper.Map<Volunteer>(dto);
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
        var obj = await _kbContext.Volunteers.FirstOrDefaultAsync(v => v.Id == id && !v.IsDeleted);
        if (obj == null)
            return NotFound();

        obj.IsDeleted = true;
        await _kbContext.SaveChangesAsync();

        return NoContent();
    }
}
