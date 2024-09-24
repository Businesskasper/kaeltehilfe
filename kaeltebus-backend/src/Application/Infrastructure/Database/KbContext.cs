using kaeltebus_backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace kaeltebus_backend.Infrastructure.Database;

public class KbContext : DbContext
{
    public virtual DbSet<Good> Goods { get; set; }
    public virtual DbSet<Location> Locations { get; set; }
    public virtual DbSet<Volunteer> Volunteers { get; set; }
    public virtual DbSet<Shift> Shifts { get; set; }
    public virtual DbSet<ShiftVolunteer> ShiftVolunteers { get; set; }
    public virtual DbSet<Client> Clients { get; set; }
    public virtual DbSet<Distribution> Distributions { get; set; }
    public virtual DbSet<Device> Devices { get; set; }

    private readonly bool _seedData;

    public KbContext(DbContextOptions<KbContext> options, IWebHostEnvironment environment)
        : base(options)
    {
        _seedData = environment.EnvironmentName == "Development";
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Good>().ConfigureBaseEntity();
        modelBuilder.Entity<Good>().HasIndex(g => g.Name).IsUnique().HasFilter("IsDeleted = 0");
        modelBuilder
            .Entity<Good>()
            .HasMany(g => g.Distributions)
            .WithOne(d => d.Good)
            .HasForeignKey(d => d.GoodId);

        modelBuilder.Entity<Device>().ConfigureBaseEntity();
        modelBuilder
            .Entity<Device>()
            .HasIndex(d => d.RegistrationNumber)
            .IsUnique()
            .HasFilter("IsDeleted = 0");
        modelBuilder
            .Entity<Device>()
            .HasMany(d => d.Shifts)
            .WithOne(s => s.Device)
            .HasForeignKey(s => s.DeviceId);
        modelBuilder
            .Entity<Device>()
            .HasMany(di => di.Distributions)
            .WithOne(de => de.Device)
            .HasForeignKey(di => di.DeviceId);

        modelBuilder.Entity<Volunteer>().ConfigureBaseEntity();
        modelBuilder
            .Entity<Volunteer>()
            .HasIndex(v => new { v.Firstname, v.Lastname })
            .IsUnique()
            .HasFilter("IsDeleted = 0");
        modelBuilder
            .Entity<Volunteer>()
            .HasMany(v => v.ShiftVolunteers)
            .WithOne(sv => sv.Volunteer)
            .HasForeignKey(sv => sv.VolunteerId);

        modelBuilder.Entity<Shift>().ConfigureBaseEntity();
        modelBuilder.Entity<Shift>().HasIndex(s => s.Date).IsUnique().HasFilter("IsDeleted = 0");
        modelBuilder
            .Entity<Shift>()
            .HasMany(s => s.ShiftVolunteers)
            .WithOne(sv => sv.Shift)
            .HasForeignKey(sv => sv.ShiftId);
        modelBuilder
            .Entity<Shift>()
            .HasOne(s => s.Device)
            .WithMany(d => d.Shifts)
            .HasForeignKey(s => s.DeviceId);

        modelBuilder.Entity<Client>().ConfigureBaseEntity();
        modelBuilder.Entity<Client>().HasIndex(c => c.Name).IsUnique().HasFilter("IsDeleted = 0");
        modelBuilder
            .Entity<Client>()
            .HasMany(c => c.Distributions)
            .WithOne(d => d.Client)
            .HasForeignKey(d => d.ClientId);

        modelBuilder.Entity<Location>().ConfigureBaseEntity();
        modelBuilder.Entity<Location>().HasIndex(l => l.Name).IsUnique().HasFilter("IsDeleted = 0");
        modelBuilder
            .Entity<Location>()
            .HasMany(l => l.Distributions)
            .WithOne(d => d.Location)
            .HasForeignKey(d => d.LocationId);

        modelBuilder.Entity<Distribution>().ConfigureBaseEntity();
        modelBuilder.Entity<Distribution>().HasIndex(x => x.DeviceId);
        modelBuilder.Entity<Distribution>().HasIndex(x => x.ClientId);
        modelBuilder.Entity<Distribution>().HasIndex(x => x.GoodId);
        modelBuilder.Entity<Distribution>().HasIndex(x => x.AddOn);
        modelBuilder
            .Entity<Distribution>()
            .HasOne(d => d.Good)
            .WithMany(g => g.Distributions)
            .HasForeignKey(d => d.GoodId);
        modelBuilder.Entity<Distribution>().Navigation(d => d.Good).AutoInclude();
        modelBuilder
            .Entity<Distribution>()
            .HasOne(d => d.Client)
            .WithMany(c => c.Distributions)
            .HasForeignKey(d => d.ClientId);
        modelBuilder.Entity<Distribution>().Navigation(d => d.Client).AutoInclude();
        modelBuilder
            .Entity<Distribution>()
            .HasOne(d => d.Device)
            .WithMany(d => d.Distributions)
            .HasForeignKey(d => d.DeviceId);
        modelBuilder.Entity<Distribution>().Navigation(d => d.Device).AutoInclude();
        modelBuilder
            .Entity<Distribution>()
            .HasOne(d => d.Location)
            .WithMany(l => l.Distributions)
            .HasForeignKey(d => d.LocationId);
        modelBuilder.Entity<Distribution>().Navigation(d => d.Location).AutoInclude();

        modelBuilder.Entity<ShiftVolunteer>().HasKey(sv => new { sv.ShiftId, sv.VolunteerId });
        modelBuilder
            .Entity<ShiftVolunteer>()
            .HasOne(sv => sv.Shift)
            .WithMany(s => s.ShiftVolunteers)
            .HasForeignKey(sv => sv.ShiftId);
        modelBuilder
            .Entity<ShiftVolunteer>()
            .HasOne(sv => sv.Volunteer)
            .WithMany(v => v.ShiftVolunteers)
            .HasForeignKey(sv => sv.VolunteerId);
        modelBuilder.Entity<ShiftVolunteer>().Property(sv => sv.Order).IsRequired();

        if (_seedData)
            Seed(modelBuilder);
    }

    private void Seed(ModelBuilder modelBuilder)
    {
        var goods = new List<Good>
        {
            new Good
            {
                Id = 1,
                Name = "Suppe",
                GoodType = GoodType.FOOD,
                AddOn = DateTime.UtcNow,
                IsDeleted = false,
            },
            new Good
            {
                Id = 2,
                Name = "Kaffee",
                GoodType = GoodType.FOOD,
                AddOn = DateTime.UtcNow,
                IsDeleted = false,
            },
            new Good
            {
                Id = 3,
                Name = "Tee",
                GoodType = GoodType.FOOD,
                AddOn = DateTime.UtcNow,
                IsDeleted = false,
            },
            new Good
            {
                Id = 4,
                Name = "Decke",
                GoodType = GoodType.CLOTHING,
                AddOn = DateTime.UtcNow,
                IsDeleted = false,
            },
            new Good
            {
                Id = 5,
                Name = "Socken",
                GoodType = GoodType.CLOTHING,
                AddOn = DateTime.UtcNow,
                IsDeleted = false,
            },
            new Good
            {
                Id = 6,
                Name = "Tempos",
                GoodType = GoodType.CONSUMABLE,
                AddOn = DateTime.UtcNow,
                IsDeleted = false,
            },
            new Good
            {
                Id = 7,
                Name = "Deo",
                GoodType = GoodType.CONSUMABLE,
                AddOn = DateTime.UtcNow,
                IsDeleted = false,
            },
        };
        modelBuilder.Entity<Good>().HasData(goods);

        var volunteers = new List<Volunteer>
        {
            new Volunteer
            {
                Id = 1,
                Firstname = "Luka",
                Lastname = "Weis",
                IsDriver = false,
                IsDeleted = false,
                Gender = Gender.MALE,
                AddOn = DateTime.UtcNow,
            },
            new Volunteer
            {
                Id = 2,
                Firstname = "Peter",
                Lastname = "Pan",
                IsDriver = true,
                IsDeleted = false,
                Gender = Gender.MALE,
                AddOn = DateTime.UtcNow,
            },
            new Volunteer
            {
                Id = 3,
                Firstname = "Max",
                Lastname = "Mustermann",
                IsDriver = false,
                IsDeleted = false,
                Gender = Gender.MALE,
                AddOn = DateTime.UtcNow,
            },
            new Volunteer
            {
                Id = 4,
                Firstname = "Corinna",
                Lastname = "Braun",
                IsDriver = true,
                IsDeleted = false,
                Gender = Gender.FEMALE,
                AddOn = DateTime.UtcNow,
            },
        };
        modelBuilder.Entity<Volunteer>().HasData(volunteers);

        var device = new Device
        {
            Id = 1,
            RegistrationNumber = "UL-RK1013",
            AddOn = DateTime.UtcNow,
            IsDeleted = false,
        };
        modelBuilder.Entity<Device>().HasData(device);

        var shift = new Shift
        {
            Id = 1,
            Date = DateOnly.FromDateTime(DateTime.Now),
            AddOn = DateTime.UtcNow,
            IsDeleted = false,
            DeviceId = device.Id,
        };
        modelBuilder.Entity<Shift>().HasData(shift);

        // Seeding keyless entities is not supported for whatever
        // modelBuilder.Entity("ShiftVolunteer").HasNoKey().HasData(
        //     new { ShiftId = 1, VolunteerId = 1, Order = 0 },
        //     new { ShiftId = 1, VolunteerId = 2, Order = 1 },
        //     new { ShiftId = 1, VolunteerId = 3, Order = 2 }
        // );

        var clients = new List<Client>
        {
            new Client
            {
                Id = 1,
                Name = "Martin",
                ApproxAge = 45,
                Gender = Gender.MALE,
                AddOn = DateTime.UtcNow,
                IsDeleted = false,
            },
            new Client
            {
                Id = 2,
                Name = "Martina",
                ApproxAge = 40,
                Gender = Gender.FEMALE,
                AddOn = DateTime.UtcNow,
                IsDeleted = false,
            },
            new Client
            {
                Id = 3,
                Name = "Tim",
                ApproxAge = 30,
                AddOn = DateTime.UtcNow,
                IsDeleted = false,
            },
        };
        modelBuilder.Entity<Client>().HasData(clients);

        var locations = new List<Location>
        {
            new Location
            {
                Id = 1,
                Name = "Alter Friedhof",
                AddOn = DateTime.UtcNow,
                IsDeleted = false,
            },
            new Location
            {
                Id = 2,
                Name = "Bahnhof",
                AddOn = DateTime.UtcNow,
                IsDeleted = false,
            },
            new Location
            {
                Id = 3,
                Name = "Neue Mitte",
                AddOn = DateTime.UtcNow,
                IsDeleted = false,
            },
            new Location
            {
                Id = 4,
                Name = "Hirschstraße",
                AddOn = DateTime.UtcNow,
                IsDeleted = false,
            },
            new Location
            {
                Id = 5,
                Name = "Schillerstraße",
                AddOn = DateTime.UtcNow,
                IsDeleted = false,
            },
        };
        modelBuilder.Entity<Location>().HasData(locations);

        var distributions = DbContextExtensions.GetRandomDistributions(
            DateTime.Now.AddDays(-10),
            DateTime.Now,
            clients,
            goods,
            locations,
            device.Id
        );
        modelBuilder.Entity<Distribution>().HasData(distributions);
    }
}

static class DbContextExtensions
{
    public static EntityTypeBuilder<TEntity> ConfigureBaseEntity<TEntity>(
        this EntityTypeBuilder<TEntity> modelBuilder
    )
        where TEntity : BaseEntity
    {
        modelBuilder.HasIndex(x => x.IsDeleted);
        modelBuilder.Property(x => x.Id).ValueGeneratedOnAdd();
        modelBuilder.Property(x => x.AddOn).ValueGeneratedOnAdd().HasDefaultValueSql("datetime()");
        modelBuilder
            .Property(x => x.ChangeOn)
            .ValueGeneratedOnUpdate()
            .HasDefaultValueSql("datetime()");
        modelBuilder.Property(x => x.IsDeleted).HasDefaultValue(false);

        return modelBuilder;
    }

    public static void RunMigrations<TContext>(this IApplicationBuilder app)
        where TContext : DbContext
    {
        using var scope = app.ApplicationServices.CreateScope();
        using var context = scope.ServiceProvider.GetRequiredService<TContext>();
        context?.Database.Migrate();
    }

    public static List<Distribution> GetRandomDistributions(
        DateTime start,
        DateTime end,
        List<Client> clients,
        List<Good> goods,
        List<Location> locations,
        int deviceId
    )
    {
        var distributions = new List<Distribution>();
        var currentDate = start;
        var random = new Random();

        var currentDistId = 1;

        while (currentDate <= end)
        {
            int countDistributions = random.Next(10);

            for (int i = 0; i <= countDistributions; i++)
            {
                var clientIndex = random.Next(clients.Count);
                var locationIndex = random.Next(locations.Count);
                var goodIndex = random.Next(goods.Count);
                var quantity = random.Next(3);

                var distribution = new Distribution
                {
                    Id = currentDistId,
                    AddOn = currentDate,
                    DeviceId = deviceId,
                    ClientId = clients[clientIndex].Id,
                    GoodId = goods[goodIndex].Id,
                    LocationId = locations[locationIndex].Id,
                    Quantity = quantity,
                    IsDeleted = false,
                };
                distributions.Add(distribution);
                currentDistId++;
            }
            currentDate = currentDate.AddDays(1);
        }

        return distributions;
    }
}
