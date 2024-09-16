namespace kaeltebus_backend.Models;

public class Location : BaseEntity
{
    public string Name { get; set; } = "";
    public virtual List<Distribution> Distributions { get; set; } = [];
}
