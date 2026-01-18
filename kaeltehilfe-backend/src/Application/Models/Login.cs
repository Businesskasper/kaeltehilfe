namespace kaeltehilfe_backend.Models;

public abstract class Login : ICloneable
{
    public string Username { get; set; } = "";
    public string IdentityProviderId { get; set; } = "";

    // Required by IDP
    public string Email { get; set; } = "";
    public DateTime CreateOn { get; set; }
    public virtual List<LoginCertificate> LoginCertificates { get; set; } = [];

    public object Clone()
    {
        return MemberwiseClone();
    }
}

public class AdminLogin : Login
{
    public string Firstname { get; set; } = "";
    public string Lastname { get; set; } = "";
}

public class OperatorLogin : Login
{
    public string RegistrationNumber { get; set; } = "";
}

public enum Role
{
    ADMIN,
    OPERATOR,
}
