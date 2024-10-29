namespace kaeltebus_backend.Infrastructure.Auth;

public interface ICertService
{
    public Task<GenerateClientCertResult> GenerateClientCert(string commonName, string pfxPassword);
}

public record GenerateClientCertResult(
    string Thumbprint,
    DateTime ValidFrom,
    DateTime ValidTo,
    string EncodedCertChain
);
