namespace kaeltebus_backend.Models;

public class Shift : BaseEntity
{
    public List<ShiftVolunteer> ShiftVolunteers { get; set; } = [];
    public DateOnly Date { get; set; }
}

public class ShiftVolunteer
{
    public Shift Shift { get; set; }
    public Volunteer Volunteer { get; set; }
    public int Order { get; set; }
}