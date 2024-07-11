using AutoMapper;
using FluentValidation;
using kaeltebus_backend.Infrastructure.Database;
using kaeltebus_backend.Models;
using Microsoft.AspNetCore.Mvc;

namespace kaeltebus_backend.Features.Shifts;

[Route("/api/[controller]")]
public class ShiftsController : CRUDQController<Shift, ShiftCreateDto, ShiftUpdateDto, ShiftListDto>
{
    public ShiftsController(
        ILogger<CRUDQController<Shift, ShiftCreateDto, ShiftUpdateDto, ShiftListDto>> logger,
        KbContext kbContext,
        IMapper mapper,
        IValidator<ShiftCreateDto> validator
    ) : base(logger, kbContext, mapper, validator) { }
}

public class ShiftCreateDto
{
    public DateOnly? Date { get; set; }
    public List<ShiftCreateVolunteerDto>? Volunteers { get; set; }
}

public class ShiftCreateVolunteerDto
{
    public int Id { get; set; }
}

public class ShiftUpdateDto : ShiftCreateDto;
public class ShiftListDto : ShiftCreateDto
{
    public int Id { get; set; }
}


public class ShiftDtoToObjProfile : Profile
{
    public ShiftDtoToObjProfile()
    {
        CreateMap<ShiftCreateDto, Shift>();
        CreateMap<Shift, ShiftCreateDto>();

        CreateMap<Shift, ShiftListDto>();

        CreateMap<ShiftUpdateDto, Shift>();
    }
}

public class ShiftCreateDtoValidator : AbstractValidator<ShiftCreateDto>
{
    public ShiftCreateDtoValidator()
    {
        RuleFor(x => x.Date).NotNull();
        RuleFor(x => x.Volunteers).NotNull();
        RuleForEach(x => x.Volunteers).SetValidator(new ShiftVolunteerDtoValidator());
    }
}

public class ShiftUpdateDtoValidator : AbstractValidator<ShiftUpdateDto>
{
    public ShiftUpdateDtoValidator()
    {
        RuleForEach(x => x.Volunteers).SetValidator(new ShiftVolunteerDtoValidator());
    }
}

public class ShiftVolunteerDtoValidator : AbstractValidator<ShiftCreateVolunteerDto>
{
    public ShiftVolunteerDtoValidator()
    {
        RuleFor(x => x.Id).NotNull();
    }
}