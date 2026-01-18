namespace kaeltehilfe_backend.shared;

public class InvalidModelStateExceptionHandler : IMiddleware
{
    public InvalidModelStateExceptionHandler() { }

    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        try
        {
            await next(context);
        }
        catch (InvalidModelStateException ex)
        {
            await HandleValidationExceptionAsync(context, ex.ErrorDictionary);
        }
    }

    private static Task HandleValidationExceptionAsync(
        HttpContext context,
        Microsoft.AspNetCore.Mvc.ModelBinding.ModelStateDictionary errorDictionary
    )
    {
        var errors = errorDictionary.ToDictionary(
            x => x.Key,
            x => x.Value?.Errors.Select(err => err.ErrorMessage)
        );

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = StatusCodes.Status400BadRequest;
        var response = new
        {
            Title = "One or more validation errors occurred.",
            Status = StatusCodes.Status400BadRequest,
            Code = "INVALID",
            Errors = errors,
        };
        var jsonResponse = System.Text.Json.JsonSerializer.Serialize(response);
        return context.Response.WriteAsync(jsonResponse);
    }
}

public static class InvalidModelStateMiddlewareExtension
{
    public static IApplicationBuilder UseInvalidModelStateHandler(this WebApplication app)
    {
        return app.UseMiddleware<InvalidModelStateExceptionHandler>();
    }
}
