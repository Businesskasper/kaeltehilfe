using AutoMapper;
using FluentValidation;
using kaeltebus_backend.Infrastructure.Database;
using kaeltebus_backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace kaeltebus_backend.Features.Distributions;

[Route("/api/[controller]")]
public class DistributionsController : ControllerBase
{
    private readonly ILogger<DistributionsController> _logger;
    private readonly KbContext _kbContext;
    private readonly IMapper _mapper;

    public DistributionsController(
        ILogger<DistributionsController> logger,
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
    public async Task<ActionResult<IEnumerable<DistributionDto>>> Query(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to
    )
    {
        var query = _kbContext.Distributions.AsQueryable().Where(x => !x.IsDeleted);
        // if (pageSize != null && page != null)
        //     query = query.Skip(((int)page - 1) * (int)pageSize);
        _logger.LogInformation($"Query distributions from {from} to {to}");
        if (from.HasValue && to.HasValue)
            query = query.Where(x => x.AddOn >= from && x.AddOn <= to);

        var objs = await query.ToListAsync();

        var dtos = _mapper.Map<List<DistributionDto>>(objs ?? []);

        return dtos;
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "ADMIN,OPERATOR")]
    public async Task<ActionResult<DistributionDto>> Get([FromRoute(Name = "id")] int id)
    {
        var obj = await _kbContext.Distributions.FirstOrDefaultAsync(d =>
            d.Id == id && !d.IsDeleted
        );
        return obj != null ? _mapper.Map<DistributionDto>(obj) : NotFound();
    }

    [HttpPost()]
    [Authorize(Roles = "ADMIN,OPERATOR")]
    public async Task<IActionResult> Create([FromBody()] DistributionCreateDto dto)
    {
        var bus =
            await _kbContext.Busses.FirstOrDefaultAsync(b =>
                b.RegistrationNumber == dto.BusRegistrationNumber && !b.IsDeleted
            ) ?? throw this.GetModelStateError("BusId", "No matching shift was found");

        var client =
            (
                dto.Client?.Id != null
                    ? await _kbContext.Clients.FirstOrDefaultAsync(c =>
                        c.Id == dto.Client.Id && !c.IsDeleted
                    )
                    : new Client { Name = dto.Client?.Name ?? "" }
            ) ?? throw this.GetModelStateError("client", $"Client {dto.Client?.Id} was not found");

        var good =
            await _kbContext.Goods.FirstOrDefaultAsync(g => g.Id == dto.GoodId && !g.IsDeleted)
            ?? throw this.GetModelStateError("goodId", $"Good {dto.GoodId} was not found");

        var distribution = new Distribution
        {
            Client = client,
            Bus = bus,
            Good = good,
            Quantity = dto.Quantity,
        };

        var result = await _kbContext.Distributions.AddAsync(distribution);
        await _kbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), routeValues: new { id = result.Entity.Id }, null);
    }

    [HttpPatch("{id}")]
    [Authorize(Roles = "ADMIN,OPERATOR")]
    public async Task<IActionResult> Update(
        [FromRoute(Name = "id")] int id,
        [FromBody()] DistributionUpdateDto dto
    )
    {
        var distribution = await _kbContext.Distributions.FirstOrDefaultAsync(d =>
            d.Id == id && !d.IsDeleted
        );
        if (distribution is null)
            return NotFound();

        distribution.Quantity = dto.Quantity;
        await _kbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "ADMIN,OPERATOR")]
    public async Task<ActionResult> Delete([FromRoute(Name = "id")] int id)
    {
        var distribution = await _kbContext.Distributions.FirstOrDefaultAsync(d =>
            d.Id == id && !d.IsDeleted
        );
        if (distribution is null)
            return NotFound();

        distribution.IsDeleted = true;
        await _kbContext.SaveChangesAsync();

        return NoContent();
    }
}
