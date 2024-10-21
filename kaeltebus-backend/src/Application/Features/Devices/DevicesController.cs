using AutoMapper;
using FluentValidation;
using kaeltebus_backend.Infrastructure.Auth;
using kaeltebus_backend.Infrastructure.Database;
using kaeltebus_backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.EntityFrameworkCore;

namespace kaeltebus_backend.Features.Devices;

[Route("/api/[controller]")]
public class DevicesController : ControllerBase
{
    protected readonly ILogger<DevicesController> _logger;
    protected readonly KbContext _kbContext;
    protected readonly IMapper _mapper;
    protected readonly IUserService _userService;
    protected readonly ICertService _certService;

    public DevicesController(
        ILogger<DevicesController> logger,
        KbContext kbContext,
        IMapper mapper,
        IUserService userService,
        ICertService certService
    )
    {
        _logger = logger;
        _kbContext = kbContext;
        _mapper = mapper;
        _userService = userService;
        _certService = certService;
    }

    [HttpGet()]
    [Authorize(Roles = "Admin,Operator")]
    public async Task<IEnumerable<DeviceDto>> Query()
    {
        var objs = await _kbContext.Devices.Where(x => !x.IsDeleted).ToListAsync();
        var dtos = _mapper.Map<List<DeviceDto>>(objs);

        return dtos;
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,Operator")]
    public async Task<ActionResult<DeviceDto>> Get([FromRoute(Name = "id")] int id)
    {
        var obj = await _kbContext.Devices.FirstOrDefaultAsync(x => x.Id == id);
        return obj != null ? _mapper.Map<DeviceDto>(obj) : NotFound();
    }

    [HttpPost()]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody()] DeviceCreateDto dto)
    {
        var obj = _mapper.Map<Device>(dto);
        var result = _kbContext.Devices.Attach(obj);
        await _kbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), routeValues: new { id = result.Entity.Id }, null);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> Put(
        [FromRoute(Name = "id")] int id,
        [FromBody(EmptyBodyBehavior = EmptyBodyBehavior.Allow)] DeviceCreateDto dto
    )
    {
        var existing = await _kbContext.Devices.FindAsync(id);
        if (existing is null)
            return NotFound();

        // var updatedEntity = _mapper.Map(dto, existing);
        var updatedEntity = _mapper.Map<Device>(dto);
        updatedEntity.Id = existing.Id;
        updatedEntity.AddOn = existing.AddOn;

        _kbContext.Entry(existing).CurrentValues.SetValues(updatedEntity);
        await _kbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> Delete([FromRoute(Name = "id")] int id)
    {
        var obj = await _kbContext.Devices.FindAsync(id);
        if (obj == null)
            return NotFound();

        obj.IsDeleted = true;
        await _kbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{id}/Login")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateLogin([FromRoute(Name = "id")] int id)
    {
        _logger.LogInformation($"Generate login for {id}");
        var device = await _kbContext.Devices.FindAsync(id);
        if (device == null)
            return NotFound();

        await _userService.GenerateLogin(device.RegistrationNumber);

        return NoContent();
    }

    [HttpPost("{id}/PasswordReset")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ResetPassword(
        [FromRoute(Name = "id")] int id,
        [FromBody] ResetPassword resetPassword
    )
    {
        _logger.LogInformation($"Reset password login for {id}");
        var device = await _kbContext.Devices.FindAsync(id);
        if (device == null)
            return NotFound();

        await _userService.ResetPassword(device.RegistrationNumber, resetPassword.Password);

        return NoContent();
    }

    [HttpPost("{id}/CertificateRequest")]
    public async Task<IActionResult> CreateCert(
        [FromRoute(Name = "id")] int id,
        [FromBody] CreateCertRequest createCertRequest
    )
    {
        _logger.LogInformation($"Generate certificate for {id}");
        var device = await _kbContext.Devices.FindAsync(id);
        if (device == null)
            return NotFound();

        _logger.LogDebug($"Found device with registration number {device.RegistrationNumber}");

        var encodedCertChain = await _certService.GenerateClientCert(
            device.RegistrationNumber,
            "Passw0rd!"
        );

        return Ok(new { EncodedCertChain = encodedCertChain });
    }
}

public class CreateCertRequest
{
    public string PfxPassword { get; set; } = "";
}
