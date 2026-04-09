using AutoMapper;
using FluentValidation;
using kaeltehilfe_backend.Models;

namespace kaeltehilfe_backend.Features.ShiftRules;

public class ShiftRuleDto
{
    public int Id { get; set; }
    public VolunteerCriterion Criterion { get; set; }
    public int Threshold { get; set; }
    public bool IsActive { get; set; }
    public int? BusId { get; set; }
    public string? BusRegistrationNumber { get; set; }
}

public class ShiftRuleCreateDto
{
    public string? Criterion { get; set; }
    public int Threshold { get; set; }
    public bool IsActive { get; set; }
    public int? BusId { get; set; }
}

public class ShiftRuleDtoProfile : Profile
{
    public ShiftRuleDtoProfile()
    {
        CreateMap<ShiftRule, ShiftRuleDto>()
            .ForMember(
                dest => dest.BusRegistrationNumber,
                opt => opt.MapFrom(src => src.Bus != null ? src.Bus.RegistrationNumber : null)
            );

        CreateMap<ShiftRuleCreateDto, ShiftRule>()
            .ForMember(
                r => r.Criterion,
                m => m.MapFrom(dto => Enum.Parse<VolunteerCriterion>(dto.Criterion!))
            );
    }
}

public class ShiftRuleCreateDtoValidator : AbstractValidator<ShiftRuleCreateDto>
{
    public ShiftRuleCreateDtoValidator()
    {
        RuleFor(x => x.Criterion).NotNull().NotEmpty();
        RuleFor(x => x.Threshold).GreaterThanOrEqualTo(1);
    }
}
