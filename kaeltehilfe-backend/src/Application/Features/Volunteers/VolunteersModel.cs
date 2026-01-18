using AutoMapper;
using FluentValidation;
using kaeltehilfe_backend.Models;

namespace kaeltehilfe_backend.Features.Volunteers;

public class VolunteerDto
{
    public int Id { get; set; }
    public string? Fullname { get; set; }
    public string? Firstname { get; set; }
    public string? Lastname { get; set; }
    public Gender? Gender { get; set; }
    public bool? IsDriver { get; set; }
    public string? Remarks { get; set; }
}

public class VolunteerCreateDto
{
    public string? Firstname { get; set; }
    public string? Lastname { get; set; }
    public string? Gender { get; set; }
    public bool? IsDriver { get; set; }
    public string? Remarks { get; set; }
}

public class VolunteerDtoToObjProfile : Profile
{
    public VolunteerDtoToObjProfile()
    {
        CreateMap<VolunteerDto, Volunteer>();
        CreateMap<Volunteer, VolunteerDto>();

        CreateMap<VolunteerCreateDto, Volunteer>()
            .ForMember(
                v => v.Gender,
                (m) =>
                    m.MapFrom(
                        (dto) =>
                            string.IsNullOrWhiteSpace(dto.Gender)
                                ? (Gender?)null
                                : Enum.Parse<Gender>(dto.Gender)
                    )
            );
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
