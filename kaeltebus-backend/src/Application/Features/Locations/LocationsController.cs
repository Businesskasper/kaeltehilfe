using AutoMapper;
using FluentValidation;
using kaeltebus_backend.Infrastructure.Auth;
using kaeltebus_backend.Infrastructure.Database;
using kaeltebus_backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace kaeltebus_backend.Features.Locations;

[Route("/api/[controller]")]
public class LocationsController
    : CRUDQController<Location, LocationCreateDto, LocationUpdateDto, LocationListDto>
{
    public LocationsController(
        ILogger<
            CRUDQController<Location, LocationCreateDto, LocationUpdateDto, LocationListDto>
        > logger,
        KbContext kbContext,
        IMapper mapper,
        IValidator<LocationCreateDto> validator
    )
        : base(logger, kbContext, mapper, validator) { }
}

public class LocationCreateDto
{
    public string Name { get; set; } = "";
}

public class LocationUpdateDto : LocationCreateDto;

public class LocationListDto : LocationCreateDto
{
    public int Id { get; set; }
}

public class LocationDtoToObjProfile : Profile
{
    public LocationDtoToObjProfile()
    {
        CreateMap<LocationCreateDto, Location>();
        CreateMap<Location, LocationCreateDto>();

        CreateMap<Location, LocationListDto>();

        CreateMap<LocationUpdateDto, Location>();
    }
}

public class LocationCreateDtoValidator : AbstractValidator<LocationCreateDto>
{
    public LocationCreateDtoValidator()
    {
        RuleFor(x => x.Name).NotNull();
    }
}

public class LocationUpdateDtoValidator : AbstractValidator<LocationUpdateDto>
{
    public LocationUpdateDtoValidator()
    {
        RuleFor(x => x.Name).NotNull();
    }
}
