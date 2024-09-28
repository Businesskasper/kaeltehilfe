using System.Reflection;
using System.Text.Json.Serialization;
using FluentValidation;
using FluentValidation.AspNetCore;
using kaeltebus_backend.Infrastructure.Auth;
using kaeltebus_backend.Infrastructure.Database;
using kaeltebus_backend.shared;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddJsonFile("appsettings.json");
builder.Configuration.AddJsonFile(
    "appsettings.Development.json",
    optional: true,
    reloadOnChange: true
);

builder.Logging.ClearProviders();
builder.Logging.AddConsole();

builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    // options.Providers.Add<BrotliCompressionProvider>();
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
        options.UseSqlite(builder.Configuration.GetConnectionString("SqliteDb"));
    }
);

var CORS_POLICY = "CorsOriginsKey";
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        name: CORS_POLICY,
        policy =>
        {
            policy.WithOrigins("http://localhost:5173");
            // policy.AllowAnyOrigin();
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

// Register authentication service to keycloak
builder.Services.AddScoped<IUserService, Keycloak>();

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
            o.Authority = builder.Configuration.GetValue<string>("Authorization:Authority");
            // o.Audience = builder.Configuration.GetValue<string>("Authorization:Client");
            o.Audience = builder.Configuration.GetValue<string>("Authorization:Audience");
            o.TokenValidationParameters = new TokenValidationParameters()
            {
                ValidateAudience = true,
                NameClaimType =
                    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress", // map name to identity name
                RoleClaimType =
                    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role" // map role claims
                ,
            };
            o.Events = new JwtBearerEvents()
            {
                OnMessageReceived = msg =>
                {
                    var token = msg?.Request.Headers.Authorization.ToString();
                    string path = msg?.Request.Path ?? "";
                    if (!string.IsNullOrEmpty(token))
                    {
                        Console.WriteLine("Access token");
                        Console.WriteLine($"URL: {path}");
                        Console.WriteLine($"Token: {token}\r\n");
                    }
                    else
                    {
                        Console.WriteLine("Access token");
                        Console.WriteLine("URL: " + path);
                        Console.WriteLine("Token: No access token provided\r\n");
                    }
                    return Task.CompletedTask;
                },
                OnTokenValidated = ctx =>
                {
                    Console.WriteLine();
                    Console.WriteLine("Claims from the access token");
                    if (ctx?.Principal != null)
                    {
                        foreach (var claim in ctx.Principal.Claims)
                        {
                            Console.WriteLine($"{claim.Type} - {claim.Value}");
                        }
                    }
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
    );

// builder.Services.AddAuthorization(options =>
// {
//     options.AddPolicy("Admin", policy => policy.RequireClaim("Admin", "true"));
//     options.AddPolicy("Operator", policy => policy.RequireClaim("Operator", "true"));
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

// Allow Request.Body to be read in controller
// Required for UPDATE logic since apparently .Net cannot implement PATCH in a proper way
app.Use(
    (context, next) =>
    {
        context.Request.EnableBuffering();
        return next();
    }
);

app.UseInvalidModelStateHandler();

app.UseSqliteUniqueExceptionHandler();

app.MapControllers();

app.RunMigrations<KbContext>();

app.Run();
