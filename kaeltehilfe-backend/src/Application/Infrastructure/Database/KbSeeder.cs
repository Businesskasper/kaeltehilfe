using kaeltehilfe_backend.Models;
using Microsoft.EntityFrameworkCore;

namespace kaeltehilfe_backend.Infrastructure.Database;

public interface ISeeder<IContext>
    where IContext : DbContext
{
    public void SeedData();
}

public class KbSeeder : ISeeder<KbContext>
{
    private readonly KbContext _kbContext;

    public KbSeeder(KbContext kbContext)
    {
        _kbContext = kbContext;
    }

    public void SeedData()
    {
        if (_kbContext.Goods.Any())
            return;

        var goods = new List<Good>
        {
            new Good
            {
                Name = "Suppe",
                GoodType = GoodType.FOOD,
                IsDeleted = false,
            },
            new Good
            {
                Name = "Kaffee",
                GoodType = GoodType.FOOD,
                IsDeleted = false,
                Tags = ["Heißgetränk"],
            },
            new Good
            {
                Name = "Tee",
                GoodType = GoodType.FOOD,
                IsDeleted = false,
                Tags = ["Heißgetränk"],
            },
            new Good
            {
                Name = "Decke",
                GoodType = GoodType.CLOTHING,
                IsDeleted = false,
                TwoWeekThreshold = 2,
            },
            new Good
            {
                Name = "Socken",
                GoodType = GoodType.CLOTHING,
                IsDeleted = false,
                TwoWeekThreshold = 3,
            },
            new Good
            {
                Name = "Tempos",
                GoodType = GoodType.CONSUMABLE,
                IsDeleted = false,
                Tags = ["Hygiene"],
            },
            new Good
            {
                Name = "Deo",
                GoodType = GoodType.CONSUMABLE,
                IsDeleted = false,
                Tags = ["Hygiene"],
            },
        };
        _kbContext.Goods.AddRange(goods);
        _kbContext.SaveChanges();

        var volunteers = new List<Volunteer>
        {
            new Volunteer
            {
                Firstname = "Luka",
                Lastname = "Weis",
                IsDriver = false,
                IsDeleted = false,
                Gender = Gender.MALE,
            },
            new Volunteer
            {
                Firstname = "Peter",
                Lastname = "Pan",
                IsDriver = true,
                IsDeleted = false,
                Gender = Gender.MALE,
            },
            new Volunteer
            {
                Firstname = "Max",
                Lastname = "Mustermann",
                IsDriver = false,
                IsDeleted = false,
                Gender = Gender.MALE,
            },
            new Volunteer
            {
                Firstname = "Corinna",
                Lastname = "Braun",
                IsDriver = true,
                IsDeleted = false,
                Gender = Gender.FEMALE,
            },
        };
        _kbContext.Volunteers.AddRange(volunteers);
        _kbContext.SaveChanges();

        var bus = new Bus { RegistrationNumber = "UL-RK1013", IsDeleted = false };
        _kbContext.Busses.Add(bus);
        _kbContext.SaveChanges();

        var shift = new Shift
        {
            Date = DateOnly.FromDateTime(DateTime.Now),
            AddOn = DateTime.UtcNow,
            IsDeleted = false,
            BusId = bus.Id,
        };
        _kbContext.Shifts.Add(shift);
        _kbContext.SaveChanges();

        var shiftVolunteers = new List<ShiftVolunteer>
        {
            new ShiftVolunteer
            {
                ShiftId = shift.Id,
                VolunteerId = volunteers[0].Id,
                Order = 0,
            },
            new ShiftVolunteer
            {
                ShiftId = shift.Id,
                VolunteerId = volunteers[1].Id,
                Order = 1,
            },
            new ShiftVolunteer
            {
                ShiftId = shift.Id,
                VolunteerId = volunteers[2].Id,
                Order = 2,
            },
        };
        _kbContext.ShiftVolunteers.AddRange(shiftVolunteers);
        _kbContext.SaveChanges();

        var clients = new List<Client>
        {
            new Client
            {
                Name = "Martin",
                ApproxAge = 45,
                Gender = Gender.MALE,
                IsDeleted = false,
            },
            new Client
            {
                Name = "Martina",
                ApproxAge = 40,
                Gender = Gender.FEMALE,
                IsDeleted = false,
            },
            new Client
            {
                Name = "Tim",
                ApproxAge = 30,
                IsDeleted = false,
            },
        };
        _kbContext.Clients.AddRange(clients);
        _kbContext.SaveChanges();

        var locations = new List<Location>
        {
            new Location { Name = "Alter Friedhof", IsDeleted = false },
            new Location { Name = "Bahnhof", IsDeleted = false },
            new Location { Name = "Neue Mitte", IsDeleted = false },
            new Location { Name = "Hirschstraße", IsDeleted = false },
            new Location { Name = "Schillerstraße", IsDeleted = false },
        };
        _kbContext.Locations.AddRange(locations);
        _kbContext.SaveChanges();

        var now = DateTime.Now;
        var distributions = GetRandomDistributions(
            now.AddDays(-10),
            now,
            clients,
            goods,
            locations,
            bus.Id
        );
        _kbContext.Distributions.AddRange(distributions);
        _kbContext.SaveChanges();
    }

    private List<Distribution> GetRandomDistributions(
        DateTime start,
        DateTime end,
        List<Client> clients,
        List<Good> goods,
        List<Location> locations,
        int busId
    )
    {
        var distributions = new List<Distribution>();
        var currentDate = start;
        var random = new Random();

        while (currentDate <= end)
        {
            int countDistributions = random.Next(6, 10);

            for (int i = 0; i <= countDistributions; i++)
            {
                var clientIndex = random.Next(0, clients.Count);
                var locationIndex = random.Next(0, locations.Count);
                var goodIndex = random.Next(0, goods.Count);
                var quantity = random.Next(1, 3);

                // Always assign geolocation to a random location within Ulm, Germany
                // Ulm coordinates: ~48.4°N, 9.98°E
                // Bounds: 48.35-48.45 latitude, 9.9-10.1 longitude
                double latitude = 48.35 + random.NextDouble() * 0.1; // 48.35 to 48.45
                double longitude = 9.9 + random.NextDouble() * 0.2; // 9.9 to 10.1
                var geoLocation = new NetTopologySuite.Geometries.Point(
                    // new NetTopologySuite.Geometries.CoordinateM(longitude, latitude)
                    longitude,
                    latitude
                )
                {
                    SRID = 4326,
                };

                var distribution = new Distribution
                {
                    AddOn = currentDate,
                    BusId = busId,
                    ClientId = clients[clientIndex].Id,
                    GoodId = goods[goodIndex].Id,
                    LocationId = locations[locationIndex].Id,
                    GeoLocation = geoLocation,
                    Quantity = quantity,
                    IsDeleted = false,
                };
                distributions.Add(distribution);
            }
            currentDate = currentDate.AddDays(1);
        }

        return distributions;
    }
}

public static class KbSeederExtensions
{
    public static IServiceCollection AddSeeder<TContext, TSeeder>(this IServiceCollection services)
        where TContext : DbContext
        where TSeeder : class, ISeeder<TContext>
    {
        return services.AddScoped<ISeeder<TContext>, TSeeder>();
    }

    public static IApplicationBuilder RunSeeder<TContext>(
        this IApplicationBuilder app,
        Func<IApplicationBuilder, bool> condition
    )
        where TContext : DbContext
    {
        if (condition(app))
        {
            using var scope = app.ApplicationServices.CreateScope();
            var seeder = scope.ServiceProvider.GetRequiredService<ISeeder<TContext>>();
            seeder.SeedData();
        }

        return app;
    }
}
