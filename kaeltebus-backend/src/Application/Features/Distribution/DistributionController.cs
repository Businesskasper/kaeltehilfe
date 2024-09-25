using AutoMapper;
using FluentValidation;
using kaeltebus_backend.Infrastructure.Database;
using kaeltebus_backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.EntityFrameworkCore;

[Route("/api/[controller]")]
public class DistributionsController : ControllerBase
{
    private readonly ILogger<DistributionsController> _logger;
    private readonly KbContext _kbContext;
    private readonly IMapper _mapper;
    private readonly IValidator<DistributionCreateDto> _validator;

    public DistributionsController(
        ILogger<DistributionsController> logger,
        KbContext kbContext,
        IMapper mapper,
        IValidator<DistributionCreateDto> validator
    )
    {
        _logger = logger;
        _kbContext = kbContext;
        _mapper = mapper;
        _validator = validator;
    }

    [HttpGet()]
    public async Task<IEnumerable<DistributionQueryDto>> Query(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to
    )
    {
        // TODO: Nur die eigenen Schichten wenn User Operator
        var query = _kbContext.Distributions.AsQueryable().Where(x => !x.IsDeleted);
        // if (pageSize != null && page != null)
        //     query = query.Skip(((int)page - 1) * (int)pageSize);
        _logger.LogInformation($"Received ${from} - ${to} query params");
        if (from.HasValue && to.HasValue)
            query = query.Where(x => x.AddOn >= from && x.AddOn <= to);

        var objs = await query.ToListAsync();

        var dtos = _mapper.Map<List<DistributionQueryDto>>(objs ?? []);

        return dtos;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<DistributionQueryDto>> Get([FromRoute(Name = "id")] int id)
    {
        var obj = await _kbContext.Distributions.FindAsync(id);
        return obj != null ? _mapper.Map<DistributionQueryDto>(obj) : NotFound();
    }

    [HttpPost()]
    public async Task<IActionResult> Create([FromBody()] DistributionCreateDto dto)
    {
        // TODO: Adjust device lookup for calling device
        var device = await _kbContext.Devices.FirstOrDefaultAsync();
        if (device == null)
            this.ThrowModelStateError("DeviceId", "No matching shift was found");

        var client =
            dto.Client?.Id != null
                ? await _kbContext.Clients.FindAsync(dto.Client.Id)
                : new Client { Name = dto.Client?.Name ?? "" };
        if (client == null)
            this.ThrowModelStateError("client", $"Client {dto.Client?.Id} was not found");

        var good = await _kbContext.Goods.FindAsync(dto.GoodId);
        if (good == null)
            this.ThrowModelStateError("goodId", $"Good {dto.GoodId} was not found");

        var distribution = new Distribution
        {
            Client = client,
            Device = device,
            Good = good,
            Quantity = dto.Quantity,
        };

        var result = await _kbContext.Distributions.AddAsync(distribution);
        await _kbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), routeValues: new { id = result.Entity.Id }, null);
    }

    [HttpPatch("{id}")]
    public async Task<IActionResult> Update(
        [FromRoute(Name = "id")] int id,
        [FromBody()] DistributionUpdateDto dto
    )
    {
        var distribution = await _kbContext.Distributions.FindAsync(id);
        if (distribution is null)
            return NotFound();

        distribution.Quantity = dto.Quantity;
        await _kbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete([FromRoute(Name = "id")] int id)
    {
        var distribution = await _kbContext.Distributions.FindAsync(id);
        if (distribution is null)
            return NotFound();

        distribution.IsDeleted = true;
        await _kbContext.SaveChangesAsync();

        return NoContent();
    }
}

public class DistributionQueryDto
{
    public int Id { get; set; }
    public DistributionQueryDevicetDto? Device { get; set; }
    public DistributionClientDto? Client { get; set; }
    public DistributionQueryGoodDto? Good { get; set; }
    public DateTime Timestamp { get; set; }
    public int Quantity { get; set; }
}

public class DistributionQueryDevicetDto
{
    public int Id { get; set; }
    public string RegistrationNumber { get; set; } = "";
}

public class DistributionClientDto
{
    public int? Id { get; set; }
    public string Name { get; set; } = "";
}

public class DistributionQueryGoodDto
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
}

public class DistributionCreateDto
{
    public DistributionClientDto? Client { get; set; }
    public int GoodId { get; set; }
    public int Quantity { get; set; }
}

public class DistributionUpdateDto
{
    public int Quantity { get; set; }
}

public class DistributionDtoProfile : Profile
{
    public DistributionDtoProfile()
    {
        CreateMap<Distribution, DistributionQueryDto>()
            .ForMember(d => d.Timestamp, src => src.MapFrom(src => src.AddOn));
        CreateMap<Device, DistributionQueryDevicetDto>();
        CreateMap<Good, DistributionQueryGoodDto>();
        CreateMap<Client, DistributionClientDto>();
    }
}

public class DistributionCreateDtoValidator : AbstractValidator<DistributionCreateDto>
{
    public DistributionCreateDtoValidator()
    {
        RuleFor(d => d.GoodId).NotNull();
        RuleFor(d => d.Quantity).GreaterThan(0);
        RuleFor(d => d.Client).NotNull();
        RuleFor(d => d.Client!.Id)
            .NotNull()
            .When(d => d.Client != null && String.IsNullOrEmpty(d.Client?.Name));
        RuleFor(d => d.Client!.Name).Empty().When(d => d.Client != null && d.Client?.Id != null);
    }
}

public class DistributionUpdateDtoValidator : AbstractValidator<DistributionUpdateDto>
{
    public DistributionUpdateDtoValidator()
    {
        RuleFor(d => d.Quantity).GreaterThan(0);
    }
}
