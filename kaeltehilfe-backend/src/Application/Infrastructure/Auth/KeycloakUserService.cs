using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using kaeltehilfe_backend.Models;

namespace kaeltehilfe_backend.Infrastructure.Auth;

public class KeycloakUserService : IUserService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly string _authority;
    private readonly string _client;
    private readonly string _clientId;
    private readonly string _keycloakApiBaseUrl;
    private readonly string _machineClient;
    private readonly string _machineClientId;
    private readonly string _machineClientSecret;
    private CachedToken? _cachedToken;

    public KeycloakUserService(IHttpClientFactory httpClientFactory, IConfiguration configuration)
    {
        _httpClientFactory = httpClientFactory;

        _authority = configuration.RequireConfigValue("Authorization:Authority");

        // Client for user auth
        _client = configuration.RequireConfigValue("Authorization:Client");
        _clientId = configuration.RequireConfigValue("Authorization:ClientId");

        // Client for machine auth
        _keycloakApiBaseUrl = configuration.RequireConfigValue("Authorization:ApiBaseUrl");
        _machineClientId = configuration.RequireConfigValue("Authorization:MachineClientId");
        _machineClient = configuration.RequireConfigValue("Authorization:MachineClient");
        var clientSecretVar = configuration.RequireConfigValue(
            "Authorization:MachineClientSecretVar"
        );

        _machineClientSecret =
            Environment.GetEnvironmentVariable(clientSecretVar)
            ?? throw new InvalidOperationException(
                $"{clientSecretVar} is not set in environment variables."
            );
    }

    public async Task<CreateUserResponse> CreateLogin(
        string username,
        string email,
        string firstName,
        string lastName,
        Role role,
        string? registrationNumber,
        string? password
    )
    {
        var userPayload = new
        {
            username,
            enabled = true,
            email,
            firstName,
            lastName,
            emailVerified = true,
            credentials = !string.IsNullOrWhiteSpace(password)
                ? new[]
                {
                    new
                    {
                        type = "password",
                        value = password,
                        temporary = true,
                    },
                }
                : null,
            attributes = registrationNumber != null
                ? new { registrationNumber = new[] { registrationNumber } }
                : null,
        };

        var createdUserIdpId = await CreateUserAsync(userPayload);

        // The create response does not include details like the "createdTimestamp"
        var createdUser =
            (await GetKeycloakUser(createdUserIdpId))
            ?? throw new Exception(
                $"User {createdUserIdpId} could not be retrieved after creation"
            );

        await AssignLoginRoles(createdUserIdpId, [role.ToString()]);

        return new CreateUserResponse(
            createdUserIdpId,
            DateTimeOffset.FromUnixTimeMilliseconds(createdUser.CreatedTimestamp).UtcDateTime
        );
    }

    public async Task UpdateLogin(
        string identityProviderId,
        string? firstname = null,
        string? lastname = null,
        string? email = null
    )
    {
        // Retrieve the current user data
        var existingUser =
            await GetKeycloakUser(identityProviderId)
            ?? throw new Exception($"User with ID {identityProviderId} not found.");

        var hasChanges = false;

        if (!string.IsNullOrWhiteSpace(firstname) && existingUser.FirstName != firstname)
        {
            existingUser.FirstName = firstname;
            hasChanges = true;
        }

        if (!string.IsNullOrWhiteSpace(lastname) && existingUser.LastName != lastname)
        {
            existingUser.LastName = lastname;
            hasChanges = true;
        }

        if (!string.IsNullOrWhiteSpace(email) && existingUser.Email != email)
        {
            existingUser.Email = email;
            hasChanges = true;
        }

        if (!hasChanges)
            return;

        var response = await KeycloakWrite(
            HttpMethod.Put,
            $"{_keycloakApiBaseUrl}/users/{identityProviderId}",
            existingUser
        );

        if (!response.IsSuccessStatusCode)
        {
            var errorMessage = await response.Content.ReadAsStringAsync();
            throw new Exception(errorMessage);
        }
    }

    public async Task<List<Login>> GetLogins()
    {
        var keycloakUsers = await KeycloakGet<List<KeycloakUser>>($"{_keycloakApiBaseUrl}/users");

        var logins = new List<Login>();
        foreach (var keycloakUser in keycloakUsers ?? [])
        {
            if (!keycloakUser.Enabled)
                continue;

            var role = await GetKeycloakUserRole(keycloakUser.Id);
            if (role is null)
                continue;

            var createdOffset = DateTimeOffset.FromUnixTimeMilliseconds(
                keycloakUser.CreatedTimestamp
            );
            var createdDate = createdOffset.UtcDateTime;
            Login login =
                role == Role.ADMIN
                    ? new AdminLogin
                    {
                        Firstname = keycloakUser.FirstName,
                        Lastname = keycloakUser.LastName,
                        Username = keycloakUser.Username,
                        IdentityProviderId = keycloakUser.Id,
                        Email = keycloakUser.Email,
                        CreateOn = createdDate,
                    }
                    : new OperatorLogin
                    {
                        RegistrationNumber = keycloakUser.Attributes.RegistrationNumber?[0] ?? "",
                        Username = keycloakUser.Username,
                        IdentityProviderId = keycloakUser.Id,
                        Email = keycloakUser.Email,
                        CreateOn = createdDate,
                    };

            logins.Add(login);
        }

        return logins;
    }

    public async Task<Login?> GetLogin(string username)
    {
        var keycloakUsers = await KeycloakGet<List<KeycloakUser>>(
            $"{_keycloakApiBaseUrl}/users?username={username}"
        );
        if (keycloakUsers is null || keycloakUsers.Count == 0)
            return null;

        var keycloakUser = keycloakUsers[0];
        var role = await GetKeycloakUserRole(keycloakUser.Id);
        var createdOffset = DateTimeOffset.FromUnixTimeMilliseconds(keycloakUser.CreatedTimestamp);
        var createdDate = createdOffset.UtcDateTime;

        return role == Role.ADMIN
            ? new AdminLogin
            {
                Firstname = keycloakUser.FirstName,
                Lastname = keycloakUser.LastName,
                Username = keycloakUser.Username,
                IdentityProviderId = keycloakUser.Id,
                Email = keycloakUser.Email,
                CreateOn = createdDate,
            }
            : new OperatorLogin
            {
                RegistrationNumber = keycloakUser.Attributes.RegistrationNumber?[0] ?? "",
                Username = keycloakUser.Username,
                IdentityProviderId = keycloakUser.Id,
                Email = keycloakUser.Email,
                CreateOn = createdDate,
            };
    }

    public async Task SetPassword(string identityProviderId, string password)
    {
        var passwordPayload = new
        {
            type = "password",
            temporary = true,
            value = password,
        };

        var response = await KeycloakWrite(
            HttpMethod.Put,
            $"{_keycloakApiBaseUrl}/users/{identityProviderId}/reset-password",
            passwordPayload
        );

        if (!response.IsSuccessStatusCode)
        {
            var errorMessage = await response.Content.ReadAsStringAsync();
            throw new Exception(
                $"Error setting password for user {identityProviderId}: {errorMessage}"
            );
        }
    }

    public async Task DeleteLogin(string identityProviderId)
    {
        var response = await KeycloakWrite(
            HttpMethod.Delete,
            $"{_keycloakApiBaseUrl}/users/{identityProviderId}",
            string.Empty
        );

        if (!response.IsSuccessStatusCode)
        {
            var errorMessage = await response.Content.ReadAsStringAsync();
            throw new Exception(
                $"Error deleting user with ID {identityProviderId}: {errorMessage}"
            );
        }
    }

    private async Task AssignLoginRoles(string userId, List<string> roles)
    {
        // Get available roles for the client (e.g., kaeltehilfe)
        var availableRoles = await GetAvailableRolesAsync();

        var rolesToAssign = availableRoles
            .Where(role =>
                roles.Any(roleToAssign =>
                    roleToAssign.Equals(role.Name, StringComparison.CurrentCultureIgnoreCase)
                )
            )
            .Select(role => new { id = role.Id, name = role.Name })
            .ToList();

        if (!rolesToAssign.Any())
            throw new Exception("No valid roles found to assign.");

        // Assign roles to the user
        var response = await KeycloakWrite(
            HttpMethod.Post,
            $"{_keycloakApiBaseUrl}/users/{userId}/role-mappings/clients/{_clientId}",
            rolesToAssign
        );

        if (!response.IsSuccessStatusCode)
        {
            var errorMessage = await response.Content.ReadAsStringAsync();
            throw new Exception($"Error assigning roles to user {userId}: {errorMessage}");
        }
    }

    private async Task<List<KeycloakRole>> GetAvailableRolesAsync()
    {
        return await KeycloakGet<List<KeycloakRole>>(
                $"{_keycloakApiBaseUrl}/clients/{_clientId}/roles"
            ) ?? [];
    }

    private async Task<KeycloakUser?> GetKeycloakUser(string userId)
    {
        return await KeycloakGet<KeycloakUser>($"{_keycloakApiBaseUrl}/users/{userId}");
    }

    private async Task<Role?> GetKeycloakUserRole(string userId)
    {
        var roleMappings = await KeycloakGet<List<KeycloakRoleMapping>>(
            $"{_keycloakApiBaseUrl}/users/{userId}/role-mappings/clients/{_clientId}"
        );

        if (roleMappings is null || roleMappings.Count == 0)
            return null;

        bool isAdmin = roleMappings.Any(m =>
            m.Name.Equals(Role.ADMIN.ToString(), StringComparison.CurrentCultureIgnoreCase)
        );
        if (isAdmin)
            return Role.ADMIN;

        bool isOperator = roleMappings.Any(m =>
            m.Name.Equals(Role.OPERATOR.ToString(), StringComparison.CurrentCultureIgnoreCase)
        );
        if (isOperator)
            return Role.OPERATOR;

        return null;
    }

    // Helper method to create a user in Keycloak
    private async Task<string> CreateUserAsync(object userPayload)
    {
        var response = await KeycloakWrite(
            HttpMethod.Post,
            $"{_keycloakApiBaseUrl}/users",
            userPayload
        );

        // Retrieve the location header which contains the ID of the created user
        var locationHeader = response.Headers.Location?.ToString();
        var createdUserId = locationHeader?.Split("/").Last();

        if (createdUserId == null)
            throw new Exception("Unable to retrieve created user ID.");

        return createdUserId;
    }

    private async Task<string> GetAdminTokenAsync()
    {
        if (_cachedToken is null || _cachedToken.ExpireTimestamp < DateTime.Now)
            _cachedToken = await FetchClientTokenAsync();

        return _cachedToken.AccessToken;
    }

    private async Task<CachedToken> FetchClientTokenAsync()
    {
        var client = _httpClientFactory.CreateClient();

        var request = new HttpRequestMessage(
            HttpMethod.Post,
            $"{_authority}/protocol/openid-connect/token"
        );
        var parameters = new Dictionary<string, string>
        {
            { "client_id", _machineClient },
            { "client_secret", _machineClientSecret },
            { "grant_type", "client_credentials" },
        };
        request.Content = new FormUrlEncodedContent(parameters);
        var response = await client.SendAsync(request);

        if (!response.IsSuccessStatusCode)
            throw new Exception("Error fetching admin token.");

        var content = await response.Content.ReadAsStringAsync();
        var tokenResponse = JsonSerializer.Deserialize<JsonElement>(
            content,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
        );
        var token = tokenResponse.GetProperty("access_token").GetString() ?? "";
        var expiresIn = tokenResponse.GetProperty("expires_in").GetInt32();

        return new CachedToken(DateTime.Now.AddSeconds(expiresIn - 10), token);
    }

    private async Task<T?> KeycloakGet<T>(string uri)
    {
        var adminToken = await GetAdminTokenAsync();

        var httpClient = _httpClientFactory.CreateClient();
        var request = new HttpRequestMessage(HttpMethod.Get, uri);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);

        var response = await httpClient.SendAsync(request);
        if (!response.IsSuccessStatusCode)
        {
            var errorMessage = await response.Content.ReadAsStringAsync();
            throw new Exception(errorMessage);
        }

        var content = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<T>(
            content,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
        );
    }

    private async Task<HttpResponseMessage> KeycloakWrite<T>(HttpMethod method, string uri, T body)
    {
        var adminToken = await GetAdminTokenAsync();

        var httpClient = _httpClientFactory.CreateClient();
        var request = new HttpRequestMessage(method, uri);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);
        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        };

        request.Content = new StringContent(
            JsonSerializer.Serialize(body, options),
            Encoding.UTF8,
            "application/json"
        );

        var response = await httpClient.SendAsync(request);

        if (!response.IsSuccessStatusCode)
        {
            var errorMessage = await response.Content.ReadAsStringAsync();
            throw new Exception(errorMessage);
        }

        return response;
    }
}

public class KeycloakUser
{
    public string Id { get; set; } = "";
    public string Username { get; set; } = "";
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public string Email { get; set; } = "";
    public bool Enabled { get; set; }
    public KeycloakUserAttributes Attributes { get; set; } = new();
    public long CreatedTimestamp { get; set; }
}

public class KeycloakUserAttributes
{
    public List<string>? RegistrationNumber { get; set; }
}

public class KeycloakRoleMapping
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public bool Composite { get; set; }
    public bool ClientRole { get; set; }
    public string ContainerId { get; set; } = "";
}

public class KeycloakRole
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
}

public record CachedToken(DateTime ExpireTimestamp, string AccessToken);
