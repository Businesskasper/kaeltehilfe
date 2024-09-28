using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

public static class ControllerExtensions
{
    public static InvalidModelStateException GetModelStateError(
        this ControllerBase controller,
        string key,
        string message
    )
    {
        var modelState = new ModelStateDictionary();
        modelState.AddModelError(key, message);
        return new InvalidModelStateException(modelState);
    }
}
