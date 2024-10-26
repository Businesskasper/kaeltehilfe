using kaeltebus_backend.Models;

namespace kaeltebus_backend.Infrastructure.Auth;

public interface IUserService
{
    public Task<CreateUserResponse> CreateLogin(
        string username,
        string email,
        Role role,
        string? registrationNumber,
        string? password
    );

    // public Task CreateLogin(string username, Role role, string? registrationNumber);
    public Task<List<Login>> GetLogins();
    public Task SetPassword(string identityProviderId, string password);
    public Task UpdateLogin(
        string identityProviderId,
        string? firstname = null,
        string? lastname = null,
        string? email = null
    );
    public Task DeleteLogin(string identityProviderId);
}

public record CreateUserResponse(string idpUsername, DateTime createdOn);
