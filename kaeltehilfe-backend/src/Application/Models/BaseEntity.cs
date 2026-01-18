namespace kaeltehilfe_backend.Models;

public class BaseEntity
{
    public int Id { get; set; }
    public DateTime AddOn { get; set; }
    public DateTime? ChangeOn { get; set; }
    public bool IsDeleted { get; set; } = false;
}
