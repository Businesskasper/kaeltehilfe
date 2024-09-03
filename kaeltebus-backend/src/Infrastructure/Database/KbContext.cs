using kaeltebus_backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Microsoft.EntityFrameworkCore.Query;

namespace kaeltebus_backend.Infrastructure.Database;

public class KbContext : DbContext
{
    public virtual DbSet<Good> Goods { get; set; }
    public virtual DbSet<Volunteer> Volunteers { get; set; }
    public virtual DbSet<Shift> Shifts { get; set; }
    public virtual DbSet<Client> Clients { get; set; }
    public virtual DbSet<Distribution> Distributions { get; set; }

    private readonly bool _seedData;

    public KbContext(DbContextOptions<KbContext> options, IWebHostEnvironment environment) : base(options)
    {
        _seedData = environment.EnvironmentName == "Development";
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Good>().ConfigureBaseEntity();
        modelBuilder.Entity<Good>().HasIndex(x => x.Name).IsUnique().HasFilter("IsDeleted = 0");

        modelBuilder.Entity<Volunteer>().ConfigureBaseEntity();
        modelBuilder.Entity<Volunteer>().HasIndex(x => new { x.Firstname, x.Lastname }).IsUnique().HasFilter("IsDeleted = 0");

        modelBuilder.Entity<Shift>().ConfigureBaseEntity();
        modelBuilder.Entity<Shift>().HasIndex(x => x.Date).IsUnique().HasFilter("IsDeleted = 0");

        modelBuilder.Entity<Client>().ConfigureBaseEntity();
        modelBuilder.Entity<Client>().HasIndex(x => x.Name).IsUnique().HasFilter("IsDeleted = 0");

        modelBuilder.Entity<Distribution>().ConfigureBaseEntity();
        modelBuilder.Entity<Distribution>().HasIndex(x => x.ClientId);
        modelBuilder.Entity<Distribution>().HasIndex(x => x.GoodId);

        // Configure Many-To-Many between Shift and Volunteer
        modelBuilder.Entity<Shift>().HasMany(x => x.Volunteers).WithMany()
           .UsingEntity<Dictionary<string, string>>("ShiftVolunteer",
               x => x.HasOne<Volunteer>().WithMany().HasForeignKey("VolunteerId"),
               x => x.HasOne<Shift>().WithMany().HasForeignKey("ShiftId"),
               x =>
               {
                   x.ToTable("ShiftVolunteer");
                   x.Property<int>("Id").ValueGeneratedOnAdd();
                   //    x.Property<int>("Order").ValueGeneratedOnAddOrUpdate().Metadata.SetAnnotation("asdf", new {});
                   //    x.Property<int>("Order").ValueGeneratedOnAddOrUpdate();
                   //    x.HasIndex("Order").IsDescending(true);
                   //    x.HasKey("VolunteerId", "ShiftId", "Order");
               }
           );
        modelBuilder.Entity<Shift>().Navigation(x => x.Volunteers).AutoInclude();

        // Configure Many-To-One between Distribution and Good, Client and Shift
        modelBuilder.Entity<Distribution>().HasOne(x => x.Good).WithMany();
        modelBuilder.Entity<Distribution>().Navigation(x => x.Good).AutoInclude();
        modelBuilder.Entity<Distribution>().HasOne(x => x.Client).WithMany();
        modelBuilder.Entity<Distribution>().Navigation(x => x.Client).AutoInclude();
        modelBuilder.Entity<Distribution>().HasOne(x => x.Shift).WithMany();
        modelBuilder.Entity<Distribution>().Navigation(x => x.Shift).AutoInclude();

        if (_seedData) Seed(modelBuilder);
    }

    private void Seed(ModelBuilder modelBuilder)
    {
        var goods = new List<Good> {
                new Good { Id = 1, Name = "Suppe", GoodType = GoodType.FOOD, AddOn = DateTime.Today, IsDeleted = false },
                new Good { Id = 2, Name = "Kaffee", GoodType = GoodType.FOOD, AddOn = DateTime.Today , IsDeleted = false},
                new Good { Id = 3, Name = "Tee", GoodType = GoodType.FOOD, AddOn = DateTime.Today, IsDeleted = false },
                new Good { Id = 4, Name = "Decke", GoodType = GoodType.CLOTHING, AddOn = DateTime.Today, IsDeleted = false },
                new Good { Id = 5, Name = "Socken", GoodType = GoodType.CLOTHING, AddOn = DateTime.Today , IsDeleted = false},
                new Good { Id = 6, Name = "Tempos", GoodType = GoodType.CONSUMABLE, AddOn = DateTime.Today , IsDeleted = false},
                new Good { Id = 7, Name = "Deo", GoodType = GoodType.CONSUMABLE, AddOn = DateTime.Today, IsDeleted = false },
            };
        modelBuilder.Entity<Good>().HasData(goods);

        var volunteers = new List<Volunteer> {
                new Volunteer { Id = 1, Firstname = "Luka", Lastname = "Weis", IsDeleted= false },
                new Volunteer { Id = 2, Firstname = "Peter", Lastname = "Pan", IsDeleted= false },
                new Volunteer { Id = 3, Firstname = "Max", Lastname = "Mustermann", IsDeleted= false }
            };
        modelBuilder.Entity<Volunteer>().HasData(volunteers);

        var shift = new { Id = 1, Date = DateOnly.FromDateTime(DateTime.Now), AddOn = DateTime.Now, IsDeleted = false };
        modelBuilder.Entity<Shift>().HasData(shift);

        modelBuilder.Entity("ShiftVolunteer").HasData(
            new { Id = 1, ShiftId = 1, VolunteerId = 1 },
            new { Id = 2, ShiftId = 1, VolunteerId = 2 },
            new { Id = 3, ShiftId = 1, VolunteerId = 3 }
        );

        var clients = new List<Client> {
                new Client { Id = 1, Name = "Martin", ApproxAge = 45, Gender = Gender.MALE, AddOn = DateTime.Now, IsDeleted = false },
                new Client { Id = 2, Name = "Martina", ApproxAge = 40, Gender = Gender.FEMALE, AddOn = DateTime.Now, IsDeleted = false },
                new Client { Id = 3, Name = "Tim", ApproxAge = 30, AddOn = DateTime.Now, IsDeleted = false }
            };
        modelBuilder.Entity<Client>().HasData(clients);

        modelBuilder.Entity<Distribution>().HasData(
            new { Id = 1, ClientId = clients[0].Id, GoodId = goods[0].Id, ShiftId = shift.Id, Quantity = 1, AddOn = DateTime.Now, IsDeleted = false },
            new { Id = 2, ClientId = clients[0].Id, GoodId = goods[1].Id, ShiftId = shift.Id, Quantity = 2, AddOn = DateTime.Now, IsDeleted = false },
            new { Id = 3, ClientId = clients[0].Id, GoodId = goods[3].Id, ShiftId = shift.Id, Quantity = 1, AddOn = DateTime.Now, IsDeleted = false },
            new { Id = 4, ClientId = clients[1].Id, GoodId = goods[1].Id, ShiftId = shift.Id, Quantity = 1, AddOn = DateTime.Now, IsDeleted = false },
            new { Id = 5, ClientId = clients[2].Id, GoodId = goods[0].Id, ShiftId = shift.Id, Quantity = 1, AddOn = DateTime.Now, IsDeleted = false },
            new { Id = 6, ClientId = clients[2].Id, GoodId = goods[2].Id, ShiftId = shift.Id, Quantity = 2, AddOn = DateTime.Now, IsDeleted = false },
            new { Id = 7, ClientId = clients[2].Id, GoodId = goods[6].Id, ShiftId = shift.Id, Quantity = 1, AddOn = DateTime.Now, IsDeleted = false }
        );
    }

}

static class DbContextExtensions
{
    public static EntityTypeBuilder<TEntity> ConfigureBaseEntity<TEntity>(this EntityTypeBuilder<TEntity> modelBuilder) where TEntity : BaseEntity
    {
        modelBuilder.HasIndex(x => x.IsDeleted);
        modelBuilder.Property(x => x.Id).ValueGeneratedOnAdd();
        modelBuilder.Property(x => x.AddOn).ValueGeneratedOnAdd().HasDefaultValueSql("datetime()");
        modelBuilder.Property(x => x.ChangeOn).ValueGeneratedOnUpdate().HasDefaultValueSql("datetime()");
        modelBuilder.Property(x => x.IsDeleted).HasDefaultValue(false);

        return modelBuilder;
    }

    public static void RunMigrations<TContext>(this IApplicationBuilder app) where TContext : DbContext
    {
        using var scope = app.ApplicationServices.CreateScope();
        using var context = scope.ServiceProvider.GetRequiredService<TContext>();
        context?.Database.Migrate();
    }
}