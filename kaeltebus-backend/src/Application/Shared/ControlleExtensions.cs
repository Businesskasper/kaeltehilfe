using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

public static class ControllerExtensions
{
    public static void ThrowModelStateError(
        this ControllerBase controller,
        string key,
        string message
    )
    {
        var modelState = new ModelStateDictionary();
        modelState.AddModelError(key, message);
        throw new InvalidModelStateException(modelState);
    }

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
