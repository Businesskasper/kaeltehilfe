using kaeltehilfe_backend.Infrastructure.Auth;
using kaeltehilfe_backend.Infrastructure.Database;
using kaeltehilfe_backend.Models;
using Microsoft.EntityFrameworkCore;

namespace kaeltehilfe_backend.Features.Busses;

public interface IBusService
{
    Task<Bus> CreateBusWithLogin(string registrationNumber);

    Task DeleteBusWithLogin(Bus bus);

    Task EnsureBusExists(string registrationNumber);
}

public class BusService : IBusService
{
    private readonly KbContext _kbContext;
    private readonly IUserService _userService;
    private readonly ILogger<BusService> _logger;

    public BusService(KbContext kbContext, IUserService userService, ILogger<BusService> logger)
    {
        _kbContext = kbContext;
        _userService = userService;
        _logger = logger;
    }

    public async Task<Bus> CreateBusWithLogin(string registrationNumber)
    {
        var bus = new Bus { RegistrationNumber = registrationNumber };
        await _kbContext.Busses.AddAsync(bus);

        var existingLogin = await _userService.GetLogin(registrationNumber.ToLower());
        if (existingLogin is null)
        {
            var email = $"{registrationNumber}@kaelte-hilfe.de";
            var createdLogin = await _userService.CreateLogin(
                registrationNumber.ToLower(),
                email,
                "Bus",
                registrationNumber,
                Role.OPERATOR,
                registrationNumber,
                null
            );
            await _kbContext.Logins.AddAsync(new OperatorLogin
            {
                RegistrationNumber = registrationNumber,
                Username = registrationNumber.ToLower(),
                Email = email,
                CreateOn = createdLogin.createdOn,
                IdentityProviderId = createdLogin.idpUsername,
            });
            _logger.LogInformation(
                "Created operator login for bus {RegistrationNumber}",
                registrationNumber
            );
        }
        else
        {
            _logger.LogInformation(
                "Operator login for bus {RegistrationNumber} already exists in Keycloak, skipping login creation",
                registrationNumber
            );
        }

        return bus;
    }

    public async Task DeleteBusWithLogin(Bus bus)
    {
        bus.IsDeleted = true;

        var username = bus.RegistrationNumber.ToLower();

        var authLogin = await _userService.GetLogin(username);
        if (authLogin is not null)
        {
            await _userService.DeleteLogin(authLogin.IdentityProviderId);
            _logger.LogInformation(
                "Deleted Keycloak login for bus {RegistrationNumber}",
                bus.RegistrationNumber
            );
        }
        else
        {
            _logger.LogWarning(
                "No Keycloak login found for bus {RegistrationNumber} during deletion",
                bus.RegistrationNumber
            );
        }

        var dbLogin = await _kbContext.Logins.FirstOrDefaultAsync(l => l.Username == username);
        if (dbLogin is not null)
        {
            _kbContext.Logins.Remove(dbLogin);
            _logger.LogInformation(
                "Deleted local login for bus {RegistrationNumber}",
                bus.RegistrationNumber
            );
        }
    }

    public async Task EnsureBusExists(string registrationNumber)
    {
        var exists = await _kbContext.Busses.AnyAsync(b =>
            b.RegistrationNumber == registrationNumber && !b.IsDeleted
        );
        if (!exists)
        {
            _logger.LogInformation(
                "Creating missing bus record for registration number {RegistrationNumber}",
                registrationNumber
            );
            await _kbContext.Busses.AddAsync(new Bus { RegistrationNumber = registrationNumber });
        }
    }
}
