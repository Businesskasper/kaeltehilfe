public class Keycloak : IAuthService
{
    private readonly ILogger<Keycloak> _logger;

    public Keycloak(ILogger<Keycloak> logger)
    {
        _logger = logger;
    }

    public async Task<string> GenerateLogin(string username)
    {
        throw new NotImplementedException();
    }

    public async Task ResetPassword(string username, string password)
    {
        _logger.LogInformation($"Reset password for {username}");
        throw new NotImplementedException();
    }
}
