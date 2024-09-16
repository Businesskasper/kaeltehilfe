using System.Reflection;
using System.Text.Json.Serialization;
using FluentValidation;
using FluentValidation.AspNetCore;
using kaeltebus_backend.Infrastructure.Database;
using kaeltebus_backend.shared;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddConsole();

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
builder.Services.AddScoped<IAuthService, Keycloak>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors(CORS_POLICY);

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
