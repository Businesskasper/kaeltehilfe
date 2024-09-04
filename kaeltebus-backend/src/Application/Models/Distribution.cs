namespace kaeltebus_backend.Models;

public class Distribution : BaseEntity
{
    public int ShiftId { get; set; }
    public virtual Shift? Shift { get; set; }
    public int ClientId { get; set; }
    public virtual Client? Client { get; set; }
    public int GoodId { get; set; }
    public virtual Good? Good { get; set; }
    public int Quantity { get; set; }
}