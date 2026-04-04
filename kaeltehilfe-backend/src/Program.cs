using System.Reflection;
using System.Text.Json;
using System.Text.Json.Serialization;
using FluentValidation;
using FluentValidation.AspNetCore;
using kaeltehilfe_backend.Features.Busses;
using kaeltehilfe_backend.Infrastructure.Auth;
using kaeltehilfe_backend.Infrastructure.Database;
using kaeltehilfe_backend.Infrastructure.File;
using kaeltehilfe_backend.shared;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NetTopologySuite.IO.Converters;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddJsonFile("appsettings.json");
builder.Configuration.AddJsonFile(
    "appsettings.Development.json",
    optional: true,
    reloadOnChange: true
);
builder.Configuration.AddEnvironmentVariables();

builder.Logging.ClearProviders();
builder.Logging.AddConsole();

builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<GzipCompressionProvider>();
});

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddAutoMapper(Assembly.GetExecutingAssembly());

builder.Services.AddDbContext<KbContext>(
    (options) =>
    {
        options.UseSqlite(
            builder.Configuration.GetConnectionString("SqliteDb"),
            options =>
            {
                options.UseNetTopologySuite();
            }
        );
    }
);

builder.Services.AddSeeder<KbContext, KbSeeder>();

builder.Services.AddLoginInitializer<KbContext, LoginInitializer>();

builder.Services.AddCrlInitializer<CrlInitializer>();

var CORS_POLICY = "CorsPolicy";

// Get the CORS origins from environment variables, default to "http://localhost:5173"
var allowedOrigins = Environment.GetEnvironmentVariable("ALLOWED_ORIGINS") ?? "http://localhost:5173";
var origins = allowedOrigins.Split(",", StringSplitOptions.RemoveEmptyEntries);

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        name: CORS_POLICY,
        policy =>
        {
            policy.WithOrigins(origins);
            policy.AllowAnyHeader();
            policy.AllowAnyMethod();
            policy.AllowCredentials();
        }
    );
});

builder
    .Services.AddControllers(x =>
    {
        x.AllowEmptyInputInBodyModelBinding = false;
        x.Filters.Add<ModelStateValidationFilter>();
    })
    .AddJsonOptions(x =>
    {
        x.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        x.JsonSerializerOptions.Converters.Add(new GeoJsonConverterFactory());
    });

// Configure fluent validation
// Disable default modelstate validation and register all validations
builder.Services.AddFluentValidationAutoValidation(x =>
{
    x.DisableDataAnnotationsValidation = true;
});
builder.Services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

// Register middleware service to catch fluent validation exceptions
builder.Services.AddTransient<InvalidModelStateExceptionHandler>();

// Register middleware service to catch UNIQUE constraint exceptions
builder.Services.AddTransient<SqliteUniqueExceptionHandler>();

// Register file service to save and get client certificates
builder.Services.AddScoped<IFileService, FileService>();

// Register certificate service to keycloak
builder.Services.AddScoped<ICertService, CertService>();

// Register authentication service to keycloak
builder.Services.AddHttpClient();

builder.Services.AddScoped<IUserService, KeycloakUserService>();
builder.Services.AddScoped<IBusService, BusService>();

// Register JWT token handling
builder.Services.AddTransient<IClaimsTransformation, KeycloakClaimsTransformer>();

builder
    .Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(
        (o) =>
        {
            if (builder.Environment.IsDevelopment())
                o.RequireHttpsMetadata = false;

            o.Authority = builder.Configuration.GetValue<string>("Authorization:Authority");
            o.Audience = builder.Configuration.GetValue<string>("Authorization:Audience");
            o.TokenValidationParameters = new TokenValidationParameters()
            {
                ValidateAudience = true,
                NameClaimType = "preferred_username",
                RoleClaimType = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
            };
            if (builder.Environment.IsDevelopment())
            {
                o.Events = new JwtBearerEvents()
                {
                    OnMessageReceived = msg =>
                    {
                        var token = msg?.Request.Headers.Authorization.ToString();
                        string path = msg?.Request.Path ?? "";
                        Console.WriteLine("Access token");
                        Console.WriteLine($"URL: {path}");
                        if (string.IsNullOrEmpty(token))
                            Console.WriteLine("Token: No access token provided\r\n");
                        else
                            Console.WriteLine($"Token: {token}\r\n");

                        return Task.CompletedTask;
                    },
                    OnTokenValidated = ctx =>
                    {
                        Console.WriteLine();
                        Console.WriteLine("Claims from the access token");
                        if (ctx?.Principal is not null)
                            foreach (var claim in ctx.Principal.Claims)
                                Console.WriteLine($"{claim.Type} - {claim.Value}");
                        Console.WriteLine();
                        return Task.CompletedTask;
                    },
                    OnAuthenticationFailed = ctx =>
                    {
                        Console.WriteLine();
                        Console.WriteLine("Auth failed");
                        var c = ctx;
                        return Task.CompletedTask;
                    },
                };
            }
        }
    );

// builder.Services.AddAuthorization(options =>
// {
//     options.AddPolicy("ADMIN", policy => policy.RequireClaim("ADMIN", "true"));
//     options.AddPolicy("OPERATOR", policy => policy.RequireClaim("OPERATOR", "true"));
// });

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseResponseCompression();

app.UseHttpsRedirection();

app.UseCors(CORS_POLICY);

app.UseAuthentication();
app.UseAuthorization();

app.UseInvalidModelStateHandler();

app.UseSqliteUniqueExceptionHandler();

app.MapControllers();

if (!app.Environment.IsEnvironment("Testing"))
{
    app.RunMigrations<KbContext>();
    app.RunSeeder<KbContext>(_ => app.Environment.IsDevelopment());
    app.InitializeLogins<KbContext>();
}

app.InitializeCrl();

app.Run();

// Make Program accessible for WebApplicationFactory<Program> in integration tests
public partial class Program { }
