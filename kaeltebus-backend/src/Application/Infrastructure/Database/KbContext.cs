using kaeltebus_backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

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

    public KbContext(DbContextOptions<KbContext> options)
        : base(options) { }

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
        modelBuilder
            .Property(x => x.AddOn)
            .ValueGeneratedOnAdd()
            .HasDefaultValueSql("unixepoch('now')")
            .HasConversion(new UnixEpochDateTimeConverter());
        modelBuilder
            .Property(x => x.ChangeOn)
            .ValueGeneratedOnUpdate()
            .HasDefaultValueSql("unixepoch('now')")
            .HasConversion(new UnixEpochDateTimeConverter());
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
}

public class UnixEpochDateTimeConverter : ValueConverter<DateTime, long>
{
    public UnixEpochDateTimeConverter()
        : base(
            v => ((DateTimeOffset)v).ToUnixTimeSeconds(),
            v => DateTimeOffset.FromUnixTimeSeconds(v).UtcDateTime
        ) { }
}
