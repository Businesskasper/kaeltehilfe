using kaeltehilfe_backend.Infrastructure.Database;
using kaeltehilfe_backend.Models;
using Microsoft.EntityFrameworkCore;

namespace kaeltehilfe_backend.Infrastructure.Auth;

public interface ILoginInitializer<IContext>
    where IContext : DbContext
{
    public Task InitializeLogins();
}

public class LoginInitializer : ILoginInitializer<KbContext>
{
    private readonly KbContext _kbContext;
    private readonly IUserService _userService;
    private readonly ILogger<LoginInitializer> _logger;

    public LoginInitializer(KbContext kbContext, IUserService userService, ILogger<LoginInitializer> logger)
    {
        _kbContext = kbContext;
        _userService = userService;
        _logger = logger;
    }

    public async Task InitializeLogins()
    {
        _logger.LogInformation("Synchronizing logins with identity provider");

        // Throws if Keycloak is unreachable — intentional: startup should fail loudly rather than
        // silently deleting all logins due to an empty provider response.
        var providerLogins = await _userService.GetLogins();
        var appLogins = await _kbContext.Logins.ToListAsync();

        // Identify logins that exist locally but are no longer in the identity provider
        var loginsToDelete = appLogins.Where(appLogin =>
            !providerLogins.Any(providerLogin =>
                providerLogin.Username == appLogin.Username
                && providerLogin.GetType() == appLogin.GetType()
            )
        ).ToList();

        if (loginsToDelete.Count > 0)
        {
            _logger.LogInformation(
                "Removing {Count} logins no longer present in identity provider: {Usernames}",
                loginsToDelete.Count,
                string.Join(", ", loginsToDelete.Select(l => l.Username))
            );
            _kbContext.Logins.RemoveRange(loginsToDelete);
        }

        // Update or add logins from provider
        foreach (var providerLogin in providerLogins)
        {
            var existingLogin = appLogins.FirstOrDefault(appLogin =>
                appLogin.Username == providerLogin.Username
                && appLogin.GetType() == providerLogin.GetType()
            );

            if (existingLogin != null)
            {
                // Update common properties
                existingLogin.IdentityProviderId = providerLogin.IdentityProviderId;
                existingLogin.Email = providerLogin.Email;
                existingLogin.CreateOn = providerLogin.CreateOn;

                // Specific updates for AdminLogin
                if (existingLogin is AdminLogin adminLogin && providerLogin is AdminLogin providerAdminLogin)
                {
                    adminLogin.Firstname = providerAdminLogin.Firstname;
                    adminLogin.Lastname = providerAdminLogin.Lastname;
                }
                // Specific updates for OperatorLogin
                else if (existingLogin is OperatorLogin operatorLogin && providerLogin is OperatorLogin providerOperatorLogin)
                {
                    operatorLogin.RegistrationNumber = providerOperatorLogin.RegistrationNumber;
                }
            }
            else
            {
                _logger.LogInformation(
                    "Adding login {Username} from identity provider",
                    providerLogin.Username
                );

                // Add new login based on its role
                if (providerLogin is AdminLogin providerAdmin)
                {
                    await _kbContext.Logins.AddAsync(new AdminLogin
                    {
                        Username = providerAdmin.Username,
                        IdentityProviderId = providerAdmin.IdentityProviderId,
                        Email = providerAdmin.Email,
                        CreateOn = providerAdmin.CreateOn,
                        Firstname = providerAdmin.Firstname,
                        Lastname = providerAdmin.Lastname,
                    });
                }
                else if (providerLogin is OperatorLogin providerOperator)
                {
                    await _kbContext.Logins.AddAsync(new OperatorLogin
                    {
                        Username = providerOperator.Username,
                        IdentityProviderId = providerOperator.IdentityProviderId,
                        Email = providerOperator.Email,
                        CreateOn = providerOperator.CreateOn,
                        RegistrationNumber = providerOperator.RegistrationNumber,
                    });
                }
            }
        }

        await _kbContext.SaveChangesAsync();
        _logger.LogInformation(
            "Login sync complete: {Total} logins from provider, {Removed} removed, {Added} added",
            providerLogins.Count,
            loginsToDelete.Count,
            providerLogins.Count(p => !appLogins.Any(a => a.Username == p.Username && a.GetType() == p.GetType()))
        );
    }
}

public static class LoginInitializerExtensions
{
    public static IServiceCollection AddLoginInitializer<TContext, TInitializer>(
        this IServiceCollection services
    )
        where TContext : DbContext
        where TInitializer : class, ILoginInitializer<TContext>
    {
        return services.AddScoped<ILoginInitializer<TContext>, TInitializer>();
    }

    public static IApplicationBuilder InitializeLogins<TContext>(this IApplicationBuilder app)
        where TContext : DbContext
    {
        using var scope = app.ApplicationServices.CreateScope();
        var loginInitializer = scope.ServiceProvider.GetRequiredService<ILoginInitializer<TContext>>();
        loginInitializer.InitializeLogins().GetAwaiter().GetResult();

        return app;
    }
}
