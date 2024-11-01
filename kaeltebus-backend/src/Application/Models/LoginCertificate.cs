namespace kaeltebus_backend.Models;

public class LoginCertificate : BaseEntity
{
    public string Thumbprint { get; set; } = "";
    public byte[] SerialNumber { get; set; } = [];
    public string Description { get; set; } = "";
    public DateTime ValidFrom { get; set; }
    public DateTime ValidTo { get; set; }
    public string FileName { get; set; } = "";
    public string LoginUsername { get; set; } = "";
    public virtual Login? Login { get; set; }
    public CertificateStatus Status { get; set; } = CertificateStatus.ACTIVE;
}

public enum CertificateStatus
{
    ACTIVE,
    REVOKED,
}
