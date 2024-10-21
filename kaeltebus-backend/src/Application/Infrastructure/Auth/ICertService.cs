namespace kaeltebus_backend.Infrastructure.Auth;

public interface ICertService
{
    public Task<string> GenerateClientCert(string commonName, string pfxPassword);
}
