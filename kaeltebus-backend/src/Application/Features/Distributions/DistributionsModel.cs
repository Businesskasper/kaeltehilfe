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
    public DistributionLocationDto? Location { get; set; }
    public DateTime Timestamp { get; set; }
    public int Quantity { get; set; }
    public NetTopologySuite.Geometries.Point? GeoLocation { get; set; }
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

public class DistributionLocationDto
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
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
            .ForMember(d => d.Timestamp, src => src.MapFrom(src => src.Timestamp))
            .ForMember(d => d.Quantity, src => src.MapFrom(src => src.Quantity))
            .ForMember(d => d.GeoLocation, src => src.MapFrom(src => src.GeoLocation));
        CreateMap<Location, DistributionLocationDto>();
        CreateMap<Bus, DistributionBusDto>();
        CreateMap<Good, DistributionGoodDto>();
        CreateMap<Client, DistributionClientDto>();
    }
}

public class DistributionUpdateDtoValidator : AbstractValidator<DistributionUpdateDto>
{
    public DistributionUpdateDtoValidator()
    {
        RuleFor(d => d.Quantity).GreaterThan(0);
    }
}
