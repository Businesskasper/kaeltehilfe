namespace kaeltehilfe_backend.Models;

public class Client : BaseEntity
{
    public string Name { get; set; } = "";
    public Gender? Gender { get; set; }
    public int ApproxAge { get; set; }
    public string Remarks { get; set; } = "";
    public virtual List<Distribution> Distributions { get; set; } = [];
}
