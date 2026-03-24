using System.Text;
using kaeltehilfe_backend.Infrastructure.File;

namespace kaeltehilfe_backend.Infrastructure.Auth;

public interface ICrlInitializer
{
    public Task InitializeCrl();
}

public class CrlInitializer : ICrlInitializer
{
    private readonly IFileService _fileService;
    private readonly ICertService _certService;
    private readonly string _crlPath;

    public CrlInitializer(IConfiguration configuration, IHostEnvironment env, IFileService fileService, ICertService certService)
    {
        _fileService = fileService;
        _certService = certService;
        _crlPath = configuration.RequireResolvedPath("CertificateSettings:CrlPath", env);
    }

    public async Task InitializeCrl()
    {
        var revocationList =
          await _fileService.ReadText(_crlPath, Encoding.ASCII);
        if (revocationList != null) return;

        var crlAsPem = _certService.CrlToPem(_certService.GenerateCrl());
        await _fileService.SaveText(_crlPath, crlAsPem, Encoding.ASCII);
    }
}

public static class CrlInitializserExtensions
{
    public static IServiceCollection AddCrlInitializer<TInitializer>(
        this IServiceCollection services
    )
        where TInitializer : class, ICrlInitializer
    {
        return services.AddScoped<ICrlInitializer, CrlInitializer>();
    }

    public static IApplicationBuilder InitializeCrl(this IApplicationBuilder app)
    {
        using var scope = app.ApplicationServices.CreateScope();
        var crlInitializer = scope.ServiceProvider.GetRequiredService<
            ICrlInitializer
        >();
        crlInitializer.InitializeCrl().GetAwaiter().GetResult();

        return app;
    }
}
