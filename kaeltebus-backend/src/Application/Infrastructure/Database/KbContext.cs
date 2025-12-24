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
    public virtual DbSet<Bus> Busses { get; set; }
    public virtual DbSet<Login> Logins { get; set; }
    public virtual DbSet<LoginCertificate> LoginCertificates { get; set; }

    // public virtual DbSet<AdminLogin> AdminLogins { get; set; }
    // public virtual DbSet<OperatorLogin> OperatorLogins { get; set; }

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

        modelBuilder.Entity<Bus>().ConfigureBaseEntity();
        modelBuilder
            .Entity<Bus>()
            .HasIndex(d => d.RegistrationNumber)
            .IsUnique()
            .HasFilter("IsDeleted = 0");
        modelBuilder
            .Entity<Bus>()
            .HasMany(d => d.Shifts)
            .WithOne(s => s.Bus)
            .HasForeignKey(s => s.BusId);
        modelBuilder
            .Entity<Bus>()
            .HasMany(di => di.Distributions)
            .WithOne(de => de.Bus)
            .HasForeignKey(di => di.BusId);

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
            .HasOne(s => s.Bus)
            .WithMany(d => d.Shifts)
            .HasForeignKey(s => s.BusId);

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
            .HasForeignKey(d => d.LocationId)
            .IsRequired(false);

        modelBuilder.Entity<Distribution>().ConfigureBaseEntity();
        modelBuilder.Entity<Distribution>().HasIndex(x => x.BusId);
        modelBuilder.Entity<Distribution>().HasIndex(x => x.ClientId);
        modelBuilder.Entity<Distribution>().HasIndex(x => x.GoodId);
        modelBuilder.Entity<Distribution>().HasIndex(x => x.AddOn);
        modelBuilder
            .Entity<Distribution>()
            .HasOne(d => d.Good)
            .WithMany(g => g.Distributions)
            .HasForeignKey(d => d.GoodId);
        modelBuilder.Entity<Distribution>().Property(d => d.GeoLocation).HasSrid(4326);
        modelBuilder.Entity<Distribution>().Navigation(d => d.Good).AutoInclude();
        modelBuilder
            .Entity<Distribution>()
            .HasOne(d => d.Client)
            .WithMany(c => c.Distributions)
            .HasForeignKey(d => d.ClientId);
        modelBuilder.Entity<Distribution>().Navigation(d => d.Client).AutoInclude();
        modelBuilder
            .Entity<Distribution>()
            .HasOne(d => d.Bus)
            .WithMany(d => d.Distributions)
            .HasForeignKey(d => d.BusId);
        modelBuilder.Entity<Distribution>().Navigation(d => d.Bus).AutoInclude();
        modelBuilder
            .Entity<Distribution>()
            .HasOne(d => d.Location)
            .WithMany(l => l.Distributions)
            .HasForeignKey(d => d.LocationId)
            .IsRequired(false);
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

        modelBuilder.Entity<Login>().HasKey(l => l.Username);
        modelBuilder
            .Entity<Login>()
            .HasDiscriminator<Role>(nameof(Role))
            .HasValue<AdminLogin>(Role.ADMIN)
            .HasValue<OperatorLogin>(Role.OPERATOR);
        modelBuilder.Entity<Login>().HasAlternateKey(a => a.IdentityProviderId);
        modelBuilder
            .Entity<Login>()
            .Property(x => x.CreateOn)
            .HasConversion(new UnixEpochDateTimeConverter());

        // Configure properties for AdminLogin
        modelBuilder.Entity<AdminLogin>().Property(a => a.Firstname).IsRequired();
        modelBuilder.Entity<AdminLogin>().Property(a => a.Lastname).IsRequired();

        // Configure properties for OperatorLogin
        modelBuilder.Entity<OperatorLogin>().Property(o => o.RegistrationNumber).IsRequired();

        // modelBuilder
        //     .Entity<AdminLogin>()
        //     .HasDiscriminator<string>("role")
        //     .HasValue<AdminLogin>("ADMIN");
        // modelBuilder.Entity<AdminLogin>().Property(a => a.Email).IsRequired();

        // modelBuilder
        //     .Entity<OperatorLogin>()
        //     .HasDiscriminator<string>("role")
        //     .HasValue<OperatorLogin>("OPERATOR");
        // modelBuilder.Entity<OperatorLogin>().Property(o => o.RegistrationNumber).IsRequired();

        modelBuilder.Entity<LoginCertificate>().ConfigureBaseEntity();
        modelBuilder
            .Entity<LoginCertificate>()
            .HasOne(lc => lc.Login)
            .WithMany(l => l.LoginCertificates)
            .HasForeignKey(lc => lc.LoginUsername);
        modelBuilder
            .Entity<LoginCertificate>()
            .Property(lc => lc.ValidFrom)
            .HasConversion(new UnixEpochDateTimeConverter());
        modelBuilder
            .Entity<LoginCertificate>()
            .Property(lc => lc.ValidTo)
            .HasConversion(new UnixEpochDateTimeConverter());
        modelBuilder
            .Entity<LoginCertificate>()
            .Property(lc => lc.SerialNumber)
            .HasColumnType("BLOB");
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
