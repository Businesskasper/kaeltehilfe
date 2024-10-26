using kaeltebus_backend.Infrastructure.Database;
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
        var providerLogins = await _userService.GetLogins();

        var appLogins = await _kbContext.Logins.ToListAsync();
        _kbContext.Logins.RemoveRange(appLogins);
        await _kbContext.SaveChangesAsync();

        await _kbContext.Logins.AddRangeAsync(providerLogins);
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
