namespace kaeltebus_backend.Models;

public class Good : BaseEntity
{
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public List<string> Tags { get; set; } = [];
    public GoodType GoodType { get; set; }
}

public enum GoodType
{
    CONSUMABLE,
    CLOTHING,
    FOOD
}