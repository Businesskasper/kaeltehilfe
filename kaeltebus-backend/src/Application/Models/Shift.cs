namespace kaeltebus_backend.Models;

public class Shift : BaseEntity
{
    public int DeviceId { get; set; }
    public virtual Device? Device { get; set; }
    public DateOnly Date { get; set; }
    public virtual List<ShiftVolunteer> ShiftVolunteers { get; set; } = [];
}

public class ShiftVolunteer
{
    public int ShiftId { get; set; }
    public virtual Shift? Shift { get; set; }
    public int VolunteerId { get; set; }
    public virtual Volunteer? Volunteer { get; set; }
    public int Order { get; set; }
}
