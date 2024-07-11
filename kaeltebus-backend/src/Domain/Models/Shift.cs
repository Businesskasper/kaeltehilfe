namespace kaeltebus_backend.Models;

public class Shift : BaseEntity
{
    public List<Volunteer> Volunteers { get; set; } = [];
    public DateOnly Date { get; set; }
}