using kaeltebus_backend.Infrastructure.Database;
using kaeltebus_backend.Models;
using Microsoft.EntityFrameworkCore;

namespace kaeltebus_backend.Infrastructure.Auth;

public interface ILoginInitializer<IContext>
    where IContext : DbContext
{
    public Task InitializeLogins();
}

public class LoginInitializer : ILoginInitializer<KbContext>
{
    private readonly KbContext _kbContext;
    private readonly IUserService _userService;

    public LoginInitializer(KbContext kbContext, IUserService userService)
    {
        _kbContext = kbContext;
        _userService = userService;
    }

    public async Task InitializeLogins()
    {
        // Fetch logins from provider and current app logins
        var providerLogins = await _userService.GetLogins();
        var appLogins = await _kbContext.Logins.ToListAsync();

        // Identify logins to delete
        var loginsToDelete = appLogins.Where(appLogin =>
            !providerLogins.Any(providerLogin =>
                providerLogin.Username == appLogin.Username
                && providerLogin.GetType() == appLogin.GetType()
            )
        );
        _kbContext.Logins.RemoveRange(loginsToDelete);

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
                if (
                    existingLogin is AdminLogin adminLogin
                    && providerLogin is AdminLogin providerAdminLogin
                )
                {
                    adminLogin.Firstname = providerAdminLogin.Firstname;
                    adminLogin.Lastname = providerAdminLogin.Lastname;
                }
                // Specific updates for OperatorLogin
                else if (
                    existingLogin is OperatorLogin operatorLogin
                    && providerLogin is OperatorLogin providerOperatorLogin
                )
                {
                    operatorLogin.RegistrationNumber = providerOperatorLogin.RegistrationNumber;
                }
            }
            else
            {
                // Add new login based on its role
                if (providerLogin is AdminLogin)
                {
                    var newAdminLogin = new AdminLogin
                    {
                        Username = providerLogin.Username,
                        IdentityProviderId = providerLogin.IdentityProviderId,
                        Email = providerLogin.Email,
                        CreateOn = providerLogin.CreateOn,
                        Firstname = ((AdminLogin)providerLogin).Firstname,
                        Lastname = ((AdminLogin)providerLogin).Lastname,
                    };
                    await _kbContext.Logins.AddAsync(newAdminLogin);
                }
                else if (providerLogin is OperatorLogin)
                {
                    var newOperatorLogin = new OperatorLogin
                    {
                        Username = providerLogin.Username,
                        IdentityProviderId = providerLogin.IdentityProviderId,
                        Email = providerLogin.Email,
                        CreateOn = providerLogin.CreateOn,
                        RegistrationNumber = ((OperatorLogin)providerLogin).RegistrationNumber,
                    };
                    await _kbContext.Logins.AddAsync(newOperatorLogin);
                }
            }
        }

        await _kbContext.SaveChangesAsync();
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

    public static IApplicationBuilder RunLoginInitializer<TContext>(this IApplicationBuilder app)
        where TContext : DbContext
    {
        using var scope = app.ApplicationServices.CreateScope();
        var loginInitializer = scope.ServiceProvider.GetRequiredService<
            ILoginInitializer<TContext>
        >();
        loginInitializer.InitializeLogins().GetAwaiter().GetResult();

        return app;
    }
}
