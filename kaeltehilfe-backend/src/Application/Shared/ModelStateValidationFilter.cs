using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.ModelBinding;

public class ModelStateValidationFilter : IAsyncActionFilter, IFilterMetadata
{
    public async Task OnActionExecutionAsync(
        ActionExecutingContext context,
        ActionExecutionDelegate next
    )
    {
        var modelState = context.ModelState;

        if (!modelState.IsValid)
            throw new InvalidModelStateException(modelState);

        await next();
    }
}

public class InvalidModelStateException : Exception
{
    public ModelStateDictionary ErrorDictionary;

    public InvalidModelStateException(ModelStateDictionary errorDictionary)
        : base("Validation Error")
    {
        ErrorDictionary = errorDictionary;
    }
}
