namespace kaeltebus_backend.Models;

public class LoginCertificate
{
    public string Thumbprint { get; set; } = "";
    public DateTime ValidFrom { get; set; }
    public DateTime ValidTo { get; set; }
    public string FileName { get; set; } = "";
    public string LoginUsername { get; set; } = "";
    public virtual Login? Login { get; set; }
}
