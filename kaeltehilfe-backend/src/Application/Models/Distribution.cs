using NetTopologySuite.Geometries;

namespace kaeltehilfe_backend.Models;

public class Distribution : BaseEntity
{
    public int BusId { get; set; }
    public virtual Bus? Bus { get; set; }
    public int ClientId { get; set; }
    public virtual Client? Client { get; set; }
    public int GoodId { get; set; }
    public virtual Good? Good { get; set; }
    public string LocationName { get; set; } = "";
    public int Quantity { get; set; }
    public Point GeoLocation { get; set; } = new Point(0, 0) { SRID = 4326 };
}
