using kaeltehilfe_backend.Models;

namespace kaeltehilfe_backend.Infrastructure.Auth;

public interface IUserService
{
    public Task<CreateUserResponse> CreateLogin(
        string username,
        string email,
        string firstName,
        string lastName,
        Role role,
        string? registrationNumber,
        string? password
    );

    public Task<List<Login>> GetLogins();
    public Task<Login?> GetLogin(string username);
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
