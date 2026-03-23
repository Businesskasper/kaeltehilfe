using System.Net.Http.Json;
using System.Security.Claims;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Serialization;
using kaeltehilfe_backend.Infrastructure.Database;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace kaeltehilfe_test;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    private SqliteConnection? _connection;
    private readonly Action<IServiceCollection>? _configureTestServices;

    public CustomWebApplicationFactory(Action<IServiceCollection>? configureTestServices = null)
    {
        _configureTestServices = configureTestServices;
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            // Remove existing DbContext and options registrations
            services.RemoveAll(typeof(DbContextOptions<KbContext>));
            services.RemoveAll(typeof(KbContext));

            // Create a shared in-memory SQLite connection that stays open
            _connection = new SqliteConnection("DataSource=:memory:");
            _connection.Open();

            services.AddDbContext<KbContext>(options =>
            {
                options.UseSqlite(_connection, x => x.UseNetTopologySuite());
            });

            // Replace default auth scheme with test handler
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = "TestScheme";
                options.DefaultChallengeScheme = "TestScheme";
            })
            .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(
                "TestScheme", _ => { });

            // Allow tests to register additional service overrides
            _configureTestServices?.Invoke(services);
        });
    }

    /// <summary>
    /// Ensures the in-memory DB schema is created. Call after CreateClient().
    /// </summary>
    public void EnsureDatabase()
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<KbContext>();
        db.Database.EnsureCreated();
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing)
        {
            _connection?.Close();
            _connection?.Dispose();
        }
    }
}

public class TestAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public TestAuthHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder)
        : base(options, logger, encoder) { }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (Request.Headers.ContainsKey("X-Test-NoAuth"))
            return Task.FromResult(AuthenticateResult.Fail("No auth"));

        var roles = Request.Headers["X-Test-Roles"].FirstOrDefault() ?? "ADMIN,OPERATOR";

        var claims = new List<Claim>
        {
            new(ClaimTypes.Name, "testuser"),
            new("preferred_username", "testuser"),
        };

        foreach (var role in roles.Split(',', StringSplitOptions.RemoveEmptyEntries))
        {
            claims.Add(new Claim(ClaimTypes.Role, role.Trim()));
        }

        var identity = new ClaimsIdentity(claims, "TestScheme");
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, "TestScheme");

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}

[TestFixture]
public abstract class IntegrationTestBase
{
    protected CustomWebApplicationFactory Factory = null!;
    protected HttpClient Client = null!;

    // Match the API's JSON serialization settings (string enums, camelCase)
    protected static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new JsonStringEnumConverter() },
    };

    protected virtual void ConfigureServices(IServiceCollection services) { }

    [SetUp]
    public void BaseSetUp()
    {
        Factory = new CustomWebApplicationFactory(ConfigureServices);
        Client = Factory.CreateClient();
        Factory.EnsureDatabase();
    }

    [TearDown]
    public void BaseTearDown()
    {
        Client?.Dispose();
        Factory?.Dispose();
    }

    protected async Task<HttpResponseMessage> PostJsonAsync<T>(string url, T body)
    {
        return await Client.PostAsJsonAsync(url, body, JsonOptions);
    }

    protected async Task<HttpResponseMessage> PutJsonAsync<T>(string url, T body)
    {
        return await Client.PutAsJsonAsync(url, body, JsonOptions);
    }

    protected async Task<HttpResponseMessage> PatchJsonAsync<T>(string url, T body)
    {
        var content = JsonContent.Create(body, options: JsonOptions);
        return await Client.PatchAsync(url, content);
    }

    protected async Task<T?> GetJsonAsync<T>(string url)
    {
        var response = await Client.GetAsync(url);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<T>(JsonOptions);
    }

    protected async Task<int> CreateAndGetId<T>(string url, T body)
    {
        var response = await PostJsonAsync(url, body);
        response.EnsureSuccessStatusCode();
        var location = response.Headers.Location?.ToString() ?? "";
        return int.Parse(location.Split('/').Last());
    }
}
