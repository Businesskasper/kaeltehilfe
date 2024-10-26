using AutoMapper;
using FluentValidation;
using kaeltebus_backend.Models;

namespace kaeltebus_backend.Features.Busses;

public class BusDto
{
    public int Id { get; set; }
    public string RegistrationNumber { get; set; } = "";
}

public class BusCreateDto
{
    public string RegistrationNumber { get; set; } = "";
}

public class BusDtoToObjProfile : Profile
{
    public BusDtoToObjProfile()
    {
        CreateMap<BusCreateDto, Bus>();
        CreateMap<Bus, BusCreateDto>();

        CreateMap<Bus, BusDto>();
    }
}

public class BusCreateDtoValidator : AbstractValidator<BusCreateDto>
{
    public BusCreateDtoValidator()
    {
        RuleFor(x => x.RegistrationNumber).NotNull().MinimumLength(5);
    }
}
