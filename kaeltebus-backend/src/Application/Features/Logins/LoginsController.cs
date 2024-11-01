using AutoMapper;
using kaeltebus_backend.Infrastructure.Auth;
using kaeltebus_backend.Infrastructure.Database;
using kaeltebus_backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.EntityFrameworkCore;

namespace kaeltebus_backend.Features.Logins;

[Route("/api/[controller]")]
public class LoginsController : ControllerBase
{
    protected readonly ILogger<LoginsController> _logger;
    protected readonly KbContext _kbContext;
    protected readonly IMapper _mapper;
    protected readonly IUserService _userService;
    protected readonly string _certFileDir;

    public LoginsController(
        IConfiguration configuration,
        ILogger<LoginsController> logger,
        KbContext kbContext,
        IMapper mapper,
        IUserService userService
    )
    {
        _logger = logger;
        _kbContext = kbContext;
        _mapper = mapper;
        _userService = userService;

        _certFileDir = configuration.RequireConfigValue("CertificateSettings:ClientCertDir");
    }

    [HttpGet()]
    [Authorize(Roles = "ADMIN")]
    public async Task<IEnumerable<LoginDto>> Query()
    {
        var objs = await _kbContext.Logins.ToListAsync();
        var dtos = _mapper.Map<List<LoginDto>>(objs);

        return dtos;
    }

    [HttpGet("{username}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<ActionResult<LoginDto>> Get([FromRoute(Name = "username")] string username)
    {
        var obj = await _kbContext.Logins.FindAsync(username);
        return obj != null ? _mapper.Map<LoginDto>(obj) : NotFound();
    }

    [HttpPost()]
    [Authorize(Roles = "ADMIN")]
    public async Task<ActionResult> Create(
        [FromBody(EmptyBodyBehavior = EmptyBodyBehavior.Allow)] LoginCreateDto dto
    )
    {
        var login = _mapper.Map<Login>(dto);

        var firstName = "";
        var lastName = "";
        if (login is OperatorLogin operatorLogin)
        {
            var bus = await _kbContext.Busses.FirstOrDefaultAsync(b =>
                b.RegistrationNumber == operatorLogin.RegistrationNumber && !b.IsDeleted
            );

            if (bus is null)
            {
                _logger.LogInformation(
                    $"Add bus with registrationNumber {operatorLogin.RegistrationNumber}"
                );
                await _kbContext.Busses.AddAsync(
                    new Bus
                    {
                        RegistrationNumber = operatorLogin.RegistrationNumber,
                        IsDeleted = false,
                    }
                );
            }

            firstName = "Bus";
            lastName = operatorLogin.RegistrationNumber;
        }
        else if (login is AdminLogin adminLogin)
        {
            firstName = adminLogin.Firstname;
            lastName = adminLogin.Lastname;
        }

        var createdUserResponse = await _userService.CreateLogin(
            login.Username,
            login.Email,
            firstName,
            lastName,
            dto.Role,
            dto.RegistrationNumber,
            dto.Password
        );
        login.IdentityProviderId = createdUserResponse.idpUsername;
        login.CreateOn = createdUserResponse.createdOn;

        await _kbContext.Logins.AddAsync(login);
        await _kbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), routeValues: new { username = login.Username }, null);
    }

    [HttpDelete("{username}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> Delete([FromRoute(Name = "username")] string username)
    {
        var obj = await _kbContext.Logins.FindAsync(username);
        if (obj == null)
            return NotFound();

        await _userService.DeleteLogin(obj.IdentityProviderId);

        _kbContext.Logins.Remove(obj);
        await _kbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{username}/Password")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> SetPassword(
        [FromRoute(Name = "username")] string username,
        [FromBody] SetPasswordRequest setPasswordRequest
    )
    {
        _logger.LogInformation($"Set password for username {username}");
        var login = await _kbContext.Logins.FindAsync(username);
        if (login == null)
            return NotFound();

        await _userService.SetPassword(username, setPasswordRequest.Password);

        return NoContent();
    }

    [HttpPatch("{username}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> Update(
        [FromRoute(Name = "username")] string username,
        [FromBody] LoginUpdateDto update
    )
    {
        var login = await _kbContext.Logins.FindAsync(username);
        if (login is null || login is not AdminLogin)
            return NotFound();

        var (hasUpdate, updated) = ObjectMethods.GetUpdated((AdminLogin)login, update);
        if (!hasUpdate)
            return NoContent();

        await _userService.UpdateLogin(
            login.IdentityProviderId,
            updated.Firstname,
            updated.Lastname,
            updated.Email
        );

        _kbContext.Entry(login).CurrentValues.SetValues(updated);
        await _kbContext.SaveChangesAsync();

        return NoContent();
    }
}
