using NetTopologySuite.Geometries;

namespace kaeltehilfe_backend.Models;

public class Comment : BaseEntity
{
    public string DisplayName { get; set; } = "";
    public string Text { get; set; } = "";
    public bool IsPinned { get; set; }
    public Point? GeoLocation { get; set; }
    public string? LocationName { get; set; }
}
