namespace kaeltebus_backend.Models;

public abstract class Login : ICloneable
{
    public string Username { get; set; } = "";
    public string IdentityProviderId { get; set; } = "";

    // Required by IDP
    public string Email { get; set; } = "";
    public DateTime CreateOn { get; set; }

    public object Clone()
    {
        return this.MemberwiseClone();
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



// namespace kaeltebus_backend.Models;

// public abstract class Login
// {
//     public string Username { get; set; } = "";
//     public string IdentityProviderId { get; set; } = "";
//     public Role Role { get; set; }
// }

// public class UserLogin : Login
// {
//     public string Firstname { get; set; } = "";
//     public string Lastname { get; set; } = "";
// }

// public class DeviceLogin : Login
// {
//     public string RegistrationNumber { get; set; } = "";
// }

// public enum Role
// {
//     ADMIN,
//     OPERATOR,
// }
