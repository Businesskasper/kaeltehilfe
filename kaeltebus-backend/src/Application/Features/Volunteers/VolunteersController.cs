using AutoMapper;
using FluentValidation;
using kaeltebus_backend.Infrastructure.Database;
using kaeltebus_backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace kaeltebus_backend.Features.Volunteers;

[Route("/api/[controller]")]
public class VolunteersController : CRUDQController<Volunteer, VolunteerCreateDto, VolunteerUpdateDto, VolunteerListDto>
{
    public VolunteersController(
        ILogger<CRUDQController<Volunteer, VolunteerCreateDto, VolunteerUpdateDto, VolunteerListDto>> logger,
        KbContext kbContext,
        IMapper mapper,
        IValidator<VolunteerCreateDto> validator
    ) : base(logger, kbContext, mapper, validator) { }
}
public class VolunteerCreateDto
{
    public string? Firstname { get; set; }
    public string? Lastname { get; set; }
    public Gender? Gender { get; set; }
    public bool? IsDriver { get; set; }
    public string? Remarks { get; set; }
}

public class VolunteerUpdateDto : VolunteerCreateDto;

public class VolunteerListDto : VolunteerCreateDto
{
    public int Id { get; set; }
    public string? Fullname { get; set; }
}

public class VolunteerDtoToObjProfile : Profile
{
    public VolunteerDtoToObjProfile()
    {
        CreateMap<VolunteerCreateDto, Volunteer>();
        CreateMap<Volunteer, VolunteerCreateDto>();

        CreateMap<Volunteer, VolunteerListDto>();

        CreateMap<VolunteerUpdateDto, Volunteer>();
    }
}

public class VolunteerCreateDtoValidator : AbstractValidator<VolunteerCreateDto>
{
    public VolunteerCreateDtoValidator()
    {
        RuleFor(x => x.Firstname).NotNull().MinimumLength(3);
        RuleFor(x => x.Lastname).NotNull().MinimumLength(3);
    }
}

public class VolunteerUpdateDtoValidator : AbstractValidator<VolunteerUpdateDto>
{
    public VolunteerUpdateDtoValidator()
    {
        RuleFor(x => x.Firstname).MinimumLength(3).When(x => x.Firstname is not null);
        RuleFor(x => x.Lastname).MinimumLength(3).When(x => x.Lastname is not null);
    }
}