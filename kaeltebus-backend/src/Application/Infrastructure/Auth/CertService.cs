using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using kaeltebus_backend.Infrastructure.Auth;
using Microsoft.Extensions.Configuration;

namespace kaeltebus_backend.Infrastructure.Auth;

public class CertService : ICertService
{
    private readonly X509Certificate2 _rootCertificate;

    public CertService(IConfiguration configuration)
    {
        // Get the root certificate path from appsettings.json
        var rootCertPath = configuration.RequireConfigValue("CertificateSettings:RootCertPath");

        // Get the root certificate password from the environment variable
        var rootCertPasswordVar = configuration.RequireConfigValue(
            "CertificateSettings:RootCertPasswordVar"
        );
        var rootCertPassword =
            Environment.GetEnvironmentVariable(rootCertPasswordVar)
            ?? throw new InvalidOperationException(
                $"{rootCertPasswordVar} is not set in environment variables."
            );

        // Load the root certificate (with private key for signing)
        _rootCertificate = new X509Certificate2(
            rootCertPath,
            rootCertPassword,
            X509KeyStorageFlags.Exportable | X509KeyStorageFlags.MachineKeySet
        );

        // Ensure that the root certificate has a private key
        if (_rootCertificate.GetRSAPrivateKey() == null)
            throw new InvalidOperationException("Root certificate does not contain a private key.");
    }

    public async Task<GenerateClientCertResult> GenerateClientCert(
        string commonName,
        string pfxPassword
    )
    {
        // Create a subject name for the client certificate
        var distinguishedName = new X500DistinguishedName($"CN={commonName}");

        using (RSA rsa = RSA.Create(2048)) // Generate a new RSA key pair for the client certificate
        {
            // Create a certificate request for the client certificate
            var request = new CertificateRequest(
                distinguishedName,
                rsa,
                HashAlgorithmName.SHA256,
                RSASignaturePadding.Pkcs1
            );

            // Add certificate extensions (example: digital signature and key usage)
            // Not a CA
            request.CertificateExtensions.Add(
                new X509BasicConstraintsExtension(false, false, 0, false)
            );
            // Digital signature
            request.CertificateExtensions.Add(
                new X509KeyUsageExtension(X509KeyUsageFlags.DigitalSignature, false)
            );
            // Subject Key Identifier
            request.CertificateExtensions.Add(
                new X509SubjectKeyIdentifierExtension(request.PublicKey, false)
            );

            // Set the validity period (1 year in this case)
            var notBefore = DateTimeOffset.UtcNow;
            var notAfter = notBefore.AddYears(1);

            // Create the client certificate, signed by the root certificate
            var clientCertificate = request.Create(
                _rootCertificate,
                notBefore,
                notAfter,
                Guid.NewGuid().ToByteArray()
            );

            // Combine the client certificate with the root certificate to form the certificate chain
            var certificateChain = new X509Certificate2Collection(
                new X509Certificate2[] { clientCertificate, _rootCertificate }
            );

            // Export the client certificate with the private key and the certificate chain
            var clientCertWithKey = clientCertificate.CopyWithPrivateKey(rsa);

            // Export the .pfx (including the private key and the entire chain) and protect it with a password
            var pfxBytes = clientCertWithKey.Export(X509ContentType.Pfx, pfxPassword);

            // Convert the .pfx to a Base64 string
            var base64Pfx = Convert.ToBase64String(pfxBytes);

            // Reverse the serial number to big-endian format for CRL compatibility
            byte[] serialNumber = clientCertificate.GetSerialNumber();
            Array.Reverse(serialNumber);

            return await Task.FromResult(
                new GenerateClientCertResult(
                    clientCertificate.Thumbprint,
                    serialNumber,
                    clientCertificate.NotBefore,
                    clientCertificate.NotAfter,
                    base64Pfx
                )
            );
        }
    }

    public byte[] AddCertToCrl(ReadOnlySpan<char> existingCrlPem, byte[] certSerialNumber)
    {
        var crlBuilder = CertificateRevocationListBuilder.LoadPem(
            existingCrlPem,
            out var crlVersion
        );

        crlBuilder.AddEntry(certSerialNumber);

        return crlBuilder.Build(
            _rootCertificate,
            crlVersion + 1,
            DateTimeOffset.UtcNow.AddYears(10),
            HashAlgorithmName.SHA256,
            RSASignaturePadding.Pkcs1
        );
    }

    public string CrlToPem(byte[] crl)
    {
        string base64Crl = Convert.ToBase64String(crl);

        string pemCrl = "-----BEGIN X509 CRL-----\n" + base64Crl + "\n-----END X509 CRL-----";

        return pemCrl;
    }

    public byte[] GenerateCrl()
    {
        var crlBuilder = new CertificateRevocationListBuilder();
        var nextUpdate = DateTimeOffset.UtcNow.AddYears(10);
        var crl = crlBuilder.Build(
            _rootCertificate,
            1,
            nextUpdate,
            HashAlgorithmName.SHA256,
            RSASignaturePadding.Pkcs1
        );

        return crl;
    }
}
