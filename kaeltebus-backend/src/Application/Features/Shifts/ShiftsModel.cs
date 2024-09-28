using AutoMapper;
using FluentValidation;
using kaeltebus_backend.Models;

namespace kaeltebus_backend.Features.Shifts;

public class ShiftDto
{
    public int Id { get; set; }
    public int DeviceId { get; set; }
    public string RegistrationNumber { get; set; } = "";
    public DateOnly? Date { get; set; }
    public List<ShiftVolunteerDto>? Volunteers { get; set; }
}

public class ShiftVolunteerDto
{
    public int Id { get; set; }
    public string Fullname { get; set; } = "";
    public Gender Gender { get; set; }
    public bool IsDriver { get; set; }
}

public class ShiftCreateDto
{
    public int DeviceId { get; set; }
    public DateOnly? Date { get; set; }
    public List<ShiftCreateVolunteerDto> Volunteers { get; set; } = [];
}

public class ShiftCreateVolunteerDto
{
    public int Id { get; set; }
}

public class ShiftDtoProfile : Profile
{
    public ShiftDtoProfile()
    {
        CreateMap<ShiftCreateDto, Shift>();

        CreateMap<Shift, ShiftDto>()
            .ForMember(
                dest => dest.Volunteers,
                opt =>
                    opt.MapFrom(src =>
                        src.ShiftVolunteers.OrderBy(sv => sv.Order)
                            .Select(sv => new ShiftVolunteerDto
                            {
                                Id = sv.Volunteer.Id,
                                Fullname = sv.Volunteer.Fullname,
                                Gender = sv.Volunteer.Gender,
                                IsDriver = sv.Volunteer.IsDriver,
                            })
                            .ToList()
                    )
            )
            .ForMember(dest => dest.Date, opt => opt.MapFrom(src => src.Date))
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.DeviceId, opt => opt.MapFrom(src => src.DeviceId))
            .ForMember(
                dest => dest.RegistrationNumber,
                opt => opt.MapFrom(src => src.Device.RegistrationNumber)
            );
    }
}

public class ShiftCreateDtoValidator : AbstractValidator<ShiftCreateDto>
{
    public ShiftCreateDtoValidator()
    {
        RuleFor(shift => shift.Date).NotNull();
        RuleFor(shift => shift.DeviceId).NotNull();
        RuleFor(shift => shift.Volunteers).NotNull();
        RuleForEach(shift => shift.Volunteers).SetValidator(new ShiftVolunteerDtoValidator());
        RuleFor(shift => shift.Volunteers)
            .Must(volunteers => !HasDuplicates(volunteers))
            .WithMessage("Volunteers can only be assigned once to a single shift");
    }

    private bool HasDuplicates(List<ShiftCreateVolunteerDto> volunteers)
    {
        return volunteers.GroupBy(volunteer => volunteer.Id).Any(group => group.Count() > 1);
    }
}

public class ShiftVolunteerDtoValidator : AbstractValidator<ShiftCreateVolunteerDto>
{
    public ShiftVolunteerDtoValidator()
    {
        RuleFor(shift => shift.Id).NotNull();
    }
}
