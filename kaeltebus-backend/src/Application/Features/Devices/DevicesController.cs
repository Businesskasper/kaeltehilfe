using AutoMapper;
using FluentValidation;
using kaeltebus_backend.Infrastructure.Database;
using kaeltebus_backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace kaeltebus_backend.Features.Devices;

[Route("/api/[controller]")]
public class DevicesController
    : CRUDQController<Device, DeviceCreateDto, DeviceUpdateDto, DeviceListDto>
{
    private readonly IAuthService _authService;

    public DevicesController(
        ILogger<CRUDQController<Device, DeviceCreateDto, DeviceUpdateDto, DeviceListDto>> logger,
        KbContext kbContext,
        IMapper mapper,
        IValidator<DeviceCreateDto> validator,
        IAuthService authService
    )
        : base(logger, kbContext, mapper, validator)
    {
        _authService = authService;
    }

    [HttpPost("{id}/Login")]
    public async Task<IActionResult> CreateLogin([FromRoute(Name = "id")] int id)
    {
        _logger.LogInformation($"Generate login for {id}");
        var device = await _kbContext.Devices.FindAsync(id);
        if (device == null)
            return NotFound();

        await _authService.GenerateLogin(device.RegistrationNumber);

        return NoContent();
    }

    [HttpPost("{id}/PasswordReset")]
    public async Task<IActionResult> ResetPassword(
        [FromRoute(Name = "id")] int id,
        [FromBody] ResetPassword resetPassword
    )
    {
        _logger.LogInformation($"Reset password login for {id}");
        var device = await _kbContext.Devices.FindAsync(id);
        if (device == null)
            return NotFound();

        await _authService.ResetPassword(device.RegistrationNumber, resetPassword.Password);

        return NoContent();
    }
}

public class ResetPassword
{
    public string Password { get; set; } = "";
}

public class DeviceCreateDto
{
    public string RegistrationNumber { get; set; } = "";
}

public class DeviceUpdateDto : DeviceCreateDto;

public class DeviceListDto : DeviceCreateDto
{
    public int Id { get; set; }
}

public class DeviceDtoToObjProfile : Profile
{
    public DeviceDtoToObjProfile()
    {
        CreateMap<DeviceCreateDto, Device>();
        CreateMap<Device, DeviceCreateDto>();

        CreateMap<Device, DeviceListDto>();

        CreateMap<DeviceUpdateDto, Device>();
    }
}

public class DeviceCreateDtoValidator : AbstractValidator<DeviceCreateDto>
{
    public DeviceCreateDtoValidator()
    {
        RuleFor(x => x.RegistrationNumber).NotNull().MinimumLength(3);
    }
}

public class DeviceUpdateDtoValidator : AbstractValidator<DeviceUpdateDto>
{
    public DeviceUpdateDtoValidator()
    {
        RuleFor(x => x.RegistrationNumber).NotNull().MinimumLength(3);
    }
}
