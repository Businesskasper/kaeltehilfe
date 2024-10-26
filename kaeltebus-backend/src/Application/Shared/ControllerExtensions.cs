using System.Text.Json;
using kaeltebus_backend.Models;
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

    public static TokenDetails GetTokenDetails(
        this IEnumerable<System.Security.Claims.Claim> claims
    )
    {
        var registrationNumber = claims.FirstOrDefault(c => c.Type == "registrationNumber")?.Value;

        var roles = new List<Role>();
        var transformedRoleClaims = claims.Where(c =>
            c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        );
        var isAdmin = transformedRoleClaims.Any(c =>
            Enum.TryParse<Role>(c.Value, out var parsedRole) && parsedRole == Role.ADMIN
        );
        var isOperator = transformedRoleClaims.Any(c =>
            Enum.TryParse<Role>(c.Value, out var parsedRole) && parsedRole == Role.OPERATOR
        );

        // var resourceAccessClaim = claims.FirstOrDefault(c => c.Type == "resource_access")?.Value;
        // var clientName = claims.FirstOrDefault(c => c.Type == "azp")?.Value;
        // if (!string.IsNullOrEmpty(resourceAccessClaim) && !string.IsNullOrEmpty(clientName))
        // {
        //     using (JsonDocument document = JsonDocument.Parse(resourceAccessClaim))
        //     {
        //         if (
        //             document.RootElement.TryGetProperty(clientName, out JsonElement clientElement)
        //             && clientElement.TryGetProperty("roles", out JsonElement rolesElement)
        //             && rolesElement.ValueKind == JsonValueKind.Array
        //         )
        //         {
        //             foreach (var role in rolesElement.EnumerateArray())
        //             {
        //                 var roleValue = role.GetString();
        //                 if (
        //                     !string.IsNullOrWhiteSpace(roleValue)
        //                     && Enum.TryParse<Role>(roleValue, out var parsedRole)
        //                 )
        //                     roles.Add(parsedRole);
        //             }
        //         }
        //     }
        // }

        return new TokenDetails(isAdmin, isOperator, registrationNumber);
    }
}

public record TokenDetails(bool IsAdmin, bool IsOperator, string? RegistrationNumber);
