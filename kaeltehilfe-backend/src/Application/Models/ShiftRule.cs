namespace kaeltehilfe_backend.Models;

public class ShiftRule : BaseEntity
{
    public VolunteerCriterion Criterion { get; set; }
    public int Threshold { get; set; }
    public bool IsActive { get; set; }
    public int? BusId { get; set; }
    public virtual Bus? Bus { get; set; }
}
