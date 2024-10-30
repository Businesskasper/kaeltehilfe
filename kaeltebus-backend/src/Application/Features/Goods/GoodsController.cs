using AutoMapper;
using FluentValidation;
using kaeltebus_backend.Infrastructure.Database;
using kaeltebus_backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.EntityFrameworkCore;

namespace kaeltebus_backend.Features.Goods;

[Route("/api/[controller]")]
public class GoodsController : ControllerBase
{
    protected readonly ILogger<GoodsController> _logger;
    protected readonly KbContext _kbContext;
    protected readonly IMapper _mapper;

    public GoodsController(ILogger<GoodsController> logger, KbContext kbContext, IMapper mapper)
    {
        _logger = logger;
        _kbContext = kbContext;
        _mapper = mapper;
    }

    [HttpGet()]
    [Authorize(Roles = "ADMIN,OPERATOR")]
    public async Task<IEnumerable<GoodDto>> Query()
    {
        var objs = await _kbContext.Goods.Where(x => !x.IsDeleted).ToListAsync();
        var dtos = _mapper.Map<List<GoodDto>>(objs);

        return dtos;
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "ADMIN,OPERATOR")]
    public async Task<ActionResult<GoodDto>> Get([FromRoute(Name = "id")] int id)
    {
        var obj = await _kbContext.Goods.FirstOrDefaultAsync(g => g.Id == id && !g.IsDeleted);
        return obj != null ? _mapper.Map<GoodDto>(obj) : NotFound();
    }

    [HttpPost()]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> Create([FromBody()] GoodCreateDto dto)
    {
        var obj = _mapper.Map<Good>(dto);
        var result = _kbContext.Goods.Attach(obj);
        await _kbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), routeValues: new { id = result.Entity.Id }, null);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<ActionResult> Put(
        [FromRoute(Name = "id")] int id,
        [FromBody(EmptyBodyBehavior = EmptyBodyBehavior.Allow)] GoodCreateDto dto
    )
    {
        var existing = await _kbContext.Goods.FirstOrDefaultAsync(g => g.Id == id && !g.IsDeleted);
        if (existing is null)
            return NotFound();

        // var updatedEntity = _mapper.Map(dto, existing);
        var updatedEntity = _mapper.Map<Good>(dto);
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
        var obj = await _kbContext.Goods.FirstOrDefaultAsync(g => g.Id == id && !g.IsDeleted);
        if (obj == null)
            return NotFound();

        obj.IsDeleted = true;
        await _kbContext.SaveChangesAsync();

        return NoContent();
    }
}
