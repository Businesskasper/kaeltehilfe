namespace kaeltebus_backend.Models;

public class Volunteer : BaseEntity
{
    public string Firstname { get; set; } = "";
    public string Lastname { get; set; } = "";
    public string Fullname
    {
        get =>
            !String.IsNullOrEmpty(Firstname) || !String.IsNullOrEmpty(Lastname)
                ? $"{Firstname} {Lastname}".Trim()
                : "";
    }
    public Gender Gender { get; set; }
    public bool IsDriver { get; set; }
    public string Remarks { get; set; } = "";
    public virtual List<ShiftVolunteer> ShiftVolunteers { get; set; } = [];
}
