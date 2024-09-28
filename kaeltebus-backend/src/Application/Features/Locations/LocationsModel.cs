using AutoMapper;
using FluentValidation;
using kaeltebus_backend.Models;

namespace kaeltebus_backend.Features.Locations;

public class LocationDto
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
}

public class LocationCreateDto
{
    public string Name { get; set; } = "";
}

public class LocationDtoToObjProfile : Profile
{
    public LocationDtoToObjProfile()
    {
        CreateMap<LocationCreateDto, Location>();
        CreateMap<Location, LocationCreateDto>();

        CreateMap<Location, LocationDto>();
    }
}

public class LocationCreateDtoValidator : AbstractValidator<LocationCreateDto>
{
    public LocationCreateDtoValidator()
    {
        RuleFor(x => x.Name).NotNull();
    }
}
