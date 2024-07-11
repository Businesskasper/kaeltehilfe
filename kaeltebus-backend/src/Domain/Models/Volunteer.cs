namespace kaeltebus_backend.Models;

public class Volunteer : BaseEntity
{
    public string Firstname { get; set; } = "";
    public string Lastname { get; set; } = "";
    public string Fullname { get => !String.IsNullOrEmpty(Fullname) || !String.IsNullOrEmpty(Lastname) ? $"{Firstname} {Lastname}".Trim() : ""; }
    public Gender Gender { get; set; }
    public bool IsDriver { get; set; }
}
