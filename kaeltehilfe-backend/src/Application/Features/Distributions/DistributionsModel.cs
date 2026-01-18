using AutoMapper;
using FluentValidation;
using kaeltehilfe_backend.Models;

namespace kaeltehilfe_backend.Features.Distributions;

public class GeoLocationDto
{
    public double Lat { get; set; }
    public double Lng { get; set; }
}

public class DistributionDto
{
    public int Id { get; set; }
    public DistributionBusDto? Bus { get; set; }
    public DistributionClientDto? Client { get; set; }
    public DistributionGoodDto? Good { get; set; }
    public DistributionLocationDto? Location { get; set; }
    public DateTime Timestamp { get; set; }
    public int Quantity { get; set; }
    public GeoLocationDto? GeoLocation { get; set; }
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
            .ForMember(d => d.Timestamp, src => src.MapFrom(src => src.AddOn))
            .ForMember(d => d.Quantity, src => src.MapFrom(src => src.Quantity))
            .ForMember(
                d => d.GeoLocation,
                src =>
                    src.MapFrom(src =>
                        src.GeoLocation != null
                            ? new GeoLocationDto
                            {
                                Lat = src.GeoLocation.Y,
                                Lng = src.GeoLocation.X,
                            }
                            : null
                    )
            );
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
