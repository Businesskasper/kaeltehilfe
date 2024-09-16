public interface IAuthService
{
    public Task<string> GenerateLogin(string username);
    public Task ResetPassword(string username, string password);
}
