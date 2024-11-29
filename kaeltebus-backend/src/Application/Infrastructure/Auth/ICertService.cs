namespace kaeltebus_backend.Infrastructure.Auth;

public interface ICertService
{
    public Task<GenerateClientCertResult> GenerateClientCert(string commonName, string pfxPassword);
    public byte[] AddCertToCrl(ReadOnlySpan<char> existingCrlPem, byte[] certSerialNumber);
    public byte[] GenerateCrl();
    public string CrlToPem(byte[] crl);
}

public record GenerateClientCertResult(
    string Thumbprint,
    byte[] SerialNumber,
    DateTime ValidFrom,
    DateTime ValidTo,
    string EncodedCertChain
);
