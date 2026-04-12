using AutoMapper;
using kaeltehilfe_backend.Features.Busses;
using kaeltehilfe_backend.Infrastructure.Auth;
using kaeltehilfe_backend.Infrastructure.Database;
using kaeltehilfe_backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

namespace kaeltehilfe_backend.Features.Logins;

[Route("/api/[controller]")]
public class LoginsController : ControllerBase
{
    private readonly ILogger<LoginsController> _logger;
    private readonly KbContext _kbContext;
    private readonly IMapper _mapper;
    private readonly IUserService _userService;
    private readonly IBusService _busService;

    public LoginsController(
        ILogger<LoginsController> logger,
        KbContext kbContext,
        IMapper mapper,
        IUserService userService,
        IBusService busService
    )
    {
        _logger = logger;
        _kbContext = kbContext;
        _mapper = mapper;
        _userService = userService;
        _busService = busService;
    }

    [HttpPost("me")]
    [Authorize(Roles = "ADMIN,OPERATOR")]
    public async Task<IActionResult> TrackLastLogin()
    {
        var username = User.Identity?.Name;
        if (username is null)
            return Unauthorized();

        var login = await _kbContext.Logins.FindAsync(username);
        if (login is null)
            return NotFound();

        login.LastLoginOn = DateTime.UtcNow;
        await _kbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet()]
    [Authorize(Roles = "ADMIN")]
    public async Task<IEnumerable<LoginDto>> Query()
    {
        var objs = await _kbContext.Logins.ToListAsync();
        return _mapper.Map<List<LoginDto>>(objs);
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
            await _busService.EnsureBusExists(operatorLogin.RegistrationNumber);
            firstName = "Bus";
            lastName = operatorLogin.RegistrationNumber;
        }
        else if (login is AdminLogin adminLogin)
        {
            firstName = adminLogin.Firstname;
            lastName = adminLogin.Lastname;
        }

        _logger.LogInformation("Creating {Role} login for {Username}", dto.Role, login.Username);
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

        _logger.LogInformation("Deleting login {Username}", username);
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
        var login = await _kbContext.Logins.FindAsync(username);
        if (login == null)
            return NotFound();

        _logger.LogInformation("Setting password for login {Username}", username);
        await _userService.SetPassword(login.IdentityProviderId, setPasswordRequest.Password);

        return NoContent();
    }

    [HttpPatch("{username}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> Update(
        [FromRoute(Name = "username")] string username,
        [FromBody] LoginUpdateDto dto
    )
    {
        var login = await _kbContext.Logins.FindAsync(username);
        if (login is null || login is not AdminLogin adminLogin)
            return NotFound();

        if (dto.Firstname is not null) adminLogin.Firstname = dto.Firstname;
        if (dto.Lastname is not null) adminLogin.Lastname = dto.Lastname;
        if (dto.Email is not null) adminLogin.Email = dto.Email;

        _logger.LogInformation("Updating admin login {Username}", username);
        await _userService.UpdateLogin(
            login.IdentityProviderId,
            dto.Firstname,
            dto.Lastname,
            dto.Email
        );

        await _kbContext.SaveChangesAsync();
        return NoContent();
    }
}
