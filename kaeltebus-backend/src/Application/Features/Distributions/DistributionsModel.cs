using AutoMapper;
using FluentValidation;
using kaeltebus_backend.Models;

namespace kaeltebus_backend.Features.Distributions;

public class DistributionDto
{
    public int Id { get; set; }
    public DistributionBusDto? Bus { get; set; }
    public DistributionClientDto? Client { get; set; }
    public DistributionGoodDto? Good { get; set; }
    public DateTime Timestamp { get; set; }
    public int Quantity { get; set; }
}

public class DistributionBusDto
{
    public int Id { get; set; }
    public string RegistrationNumber { get; set; } = "";
}

public class DistributionClientDto
{
    public int? Id { get; set; }
    public string Name { get; set; } = "";
}

public class DistributionGoodDto
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
}

public class DistributionCreateDto
{
    public DistributionClientDto? Client { get; set; }
    public int GoodId { get; set; }
    public string BusRegistrationNumber { get; set; } = "";
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
        CreateMap<Distribution, DistributionDto>()
            .ForMember(d => d.Timestamp, src => src.MapFrom(src => src.AddOn));
        CreateMap<Bus, DistributionBusDto>();
        CreateMap<Good, DistributionGoodDto>();
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
        RuleFor(d => d.BusRegistrationNumber).NotEmpty().MinimumLength(5);
    }
}

public class DistributionUpdateDtoValidator : AbstractValidator<DistributionUpdateDto>
{
    public DistributionUpdateDtoValidator()
    {
        RuleFor(d => d.Quantity).GreaterThan(0);
    }
}
