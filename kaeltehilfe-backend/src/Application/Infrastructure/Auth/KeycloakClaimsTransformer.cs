using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication;

namespace kaeltehilfe_backend.Infrastructure.Auth;

public class KeycloakClaimsTransformer : IClaimsTransformation
{
    private readonly IConfiguration _configuration;

    public KeycloakClaimsTransformer(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        if (principal.Identity is not ClaimsIdentity identity)
        {
            // If the identity is null or not a ClaimsIdentity, return the original principal.
            return Task.FromResult(principal);
        }

        var transformedIdentity = new ClaimsIdentity(
            identity.Claims,
            identity.AuthenticationType,
            identity.NameClaimType,
            identity.RoleClaimType
        );

        var resourceAccessClaim = principal
            .Claims.FirstOrDefault(fu => fu.Type == "resource_access")
            ?.Value;

        if (!string.IsNullOrEmpty(resourceAccessClaim))
        {
            using (JsonDocument document = JsonDocument.Parse(resourceAccessClaim))
            {
                var clientName = _configuration["Authorization:Client"];
                if (
                    !string.IsNullOrWhiteSpace(clientName)
                    && document.RootElement.TryGetProperty(
                        clientName,
                        out JsonElement clientElement
                    )
                    && clientElement.TryGetProperty("roles", out JsonElement rolesElement)
                    && rolesElement.ValueKind == JsonValueKind.Array
                )
                {
                    foreach (var role in rolesElement.EnumerateArray())
                    {
                        var roleValue = role.GetString();
                        if (string.IsNullOrWhiteSpace(roleValue))
                            continue;

                        transformedIdentity.AddClaim(
                            new Claim(
                                @"http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
                                roleValue
                            )
                        );
                    }
                }
            }
        }

        return Task.FromResult(new ClaimsPrincipal(transformedIdentity));
    }
}
