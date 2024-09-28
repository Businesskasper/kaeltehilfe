using AutoMapper;
using FluentValidation;
using kaeltebus_backend.Infrastructure.Auth;
using kaeltebus_backend.Infrastructure.Database;
using kaeltebus_backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace kaeltebus_backend.Features.Devices;

public class ResetPassword
{
    public string Password { get; set; } = "";
}

public class DeviceDto
{
    public int Id { get; set; }
    public string RegistrationNumber { get; set; } = "";
}

public class DeviceCreateDto
{
    public string RegistrationNumber { get; set; } = "";
}

public class DeviceDtoToObjProfile : Profile
{
    public DeviceDtoToObjProfile()
    {
        CreateMap<DeviceCreateDto, Device>();
        CreateMap<Device, DeviceCreateDto>();

        CreateMap<Device, DeviceDto>();
    }
}

public class DeviceCreateDtoValidator : AbstractValidator<DeviceCreateDto>
{
    public DeviceCreateDtoValidator()
    {
        RuleFor(x => x.RegistrationNumber).NotNull().MinimumLength(3);
    }
}
