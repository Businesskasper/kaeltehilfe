namespace kaeltebus_backend.Infrastructure.Auth;

public interface IUserService
{
    public Task<string> GenerateLogin(string username);
    public Task ResetPassword(string username, string password);
}
