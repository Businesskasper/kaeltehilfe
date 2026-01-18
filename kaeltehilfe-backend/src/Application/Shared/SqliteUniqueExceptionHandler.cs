namespace kaeltehilfe_backend.shared;

public class SqliteUniqueExceptionHandler : IMiddleware
{
    public SqliteUniqueExceptionHandler() { }

    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex) when (ex.InnerException is Microsoft.Data.Sqlite.SqliteException)
        {
            await HandleSqliteException(context, ex);
        }
    }

    private static Task HandleSqliteException(HttpContext context, Exception ex)
    {
        if (ex.InnerException is not Microsoft.Data.Sqlite.SqliteException)
            throw ex;

        if (((Microsoft.Data.Sqlite.SqliteException)ex.InnerException).SqliteErrorCode != 19)
            throw ex;

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = StatusCodes.Status400BadRequest;
        var response = new
        {
            Title = "An object with provided key already exists.",
            Code = "DUPLICATE",
            Status = StatusCodes.Status400BadRequest,
        };
        var jsonResponse = System.Text.Json.JsonSerializer.Serialize(response);
        return context.Response.WriteAsync(jsonResponse);
    }
}

public static class SqliteUniqueExceptionHandlerExtension
{
    public static IApplicationBuilder UseSqliteUniqueExceptionHandler(this WebApplication app)
    {
        return app.UseMiddleware<SqliteUniqueExceptionHandler>();
    }
}
