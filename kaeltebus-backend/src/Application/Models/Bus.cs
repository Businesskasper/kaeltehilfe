namespace kaeltebus_backend.Models;

public class Bus : BaseEntity
{
    public string RegistrationNumber { get; set; } = "";
    public virtual List<Shift> Shifts { get; set; } = [];
    public virtual List<Distribution> Distributions { get; set; } = [];
}
