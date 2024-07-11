using kaeltebus_backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
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
        modelBuilder.Entity<Good>().HasAlternateKey(x => x.Name);
        modelBuilder.Entity<Volunteer>().ConfigureBaseEntity();
        modelBuilder.Entity<Volunteer>().HasAlternateKey(x => new { x.Firstname, x.Lastname });
        modelBuilder.Entity<Shift>().ConfigureBaseEntity();
        modelBuilder.Entity<Client>().ConfigureBaseEntity();
        modelBuilder.Entity<Client>().HasAlternateKey(x => x.Name);
        modelBuilder.Entity<Distribution>().ConfigureBaseEntity();
        modelBuilder.Entity<Distribution>().HasIndex(x => x.ClientId);
        modelBuilder.Entity<Distribution>().HasIndex(x => x.GoodId);

        // Configure Many-To-Many between Shift and Volunteer
        modelBuilder.Entity<Shift>().HasMany(x => x.Volunteers).WithMany()
           .UsingEntity<Dictionary<string, string>>("ShiftVolunteer",
               x => x.HasOne<Volunteer>().WithMany().HasForeignKey("VolunteerId").OnDelete(DeleteBehavior.SetNull),
               x => x.HasOne<Shift>().WithMany().HasForeignKey("ShiftId").OnDelete(DeleteBehavior.SetNull),
               x => x.ToTable("ShiftVolunteer")
           );

        // Configure Many-To-One between Distribution and Good, Client and Shift
        modelBuilder.Entity<Distribution>().HasOne(x => x.Good).WithMany().OnDelete(DeleteBehavior.SetNull);
        modelBuilder.Entity<Distribution>().HasOne(x => x.Client).WithMany().OnDelete(DeleteBehavior.SetNull); ;
        modelBuilder.Entity<Distribution>().HasOne(x => x.Shift).WithMany().OnDelete(DeleteBehavior.SetNull); ;

        if (_seedData) Seed(modelBuilder);
    }

    private void Seed(ModelBuilder modelBuilder)
    {
        var goods = new List<Good> {
                new Good { Id = 1, Name = "Suppe", GoodType = GoodType.FOOD, AddOn = DateTime.Today },
                new Good { Id = 2, Name = "Kaffee", GoodType = GoodType.FOOD, AddOn = DateTime.Today },
                new Good { Id = 3, Name = "Tee", GoodType = GoodType.FOOD, AddOn = DateTime.Today },
                new Good { Id = 4, Name = "Decke", GoodType = GoodType.CLOTHING, AddOn = DateTime.Today },
                new Good { Id = 5, Name = "Socken", GoodType = GoodType.CLOTHING, AddOn = DateTime.Today },
                new Good { Id = 6, Name = "Tempos", GoodType = GoodType.CONSUMABLE, AddOn = DateTime.Today },
                new Good { Id = 7, Name = "Deo", GoodType = GoodType.CONSUMABLE, AddOn = DateTime.Today },
            };
        modelBuilder.Entity<Good>().HasData(goods);

        var volunteers = new List<Volunteer> {
                new Volunteer { Id = 1, Firstname = "Luka", Lastname = "Weis" },
                new Volunteer { Id = 2, Firstname = "Peter", Lastname = "Pan" },
                new Volunteer { Id = 3, Firstname = "Max", Lastname = "Mustermann" }
            };
        modelBuilder.Entity<Volunteer>().HasData(volunteers);

        var shift = new { Id = 1, Date = DateOnly.FromDateTime(DateTime.Now), AddOn = DateTime.Now };
        modelBuilder.Entity<Shift>().HasData(shift);

        modelBuilder.Entity("ShiftVolunteer").HasData(new { ShiftId = 1, VolunteerId = 1 });

        var clients = new List<Client> {
                new Client { Id = 1, Name = "Martin", ApproxAge = 45, Gender = Gender.MALE, AddOn = DateTime.Now },
                new Client { Id = 2, Name = "Martina", ApproxAge = 40, Gender = Gender.FEMALE, AddOn = DateTime.Now },
                new Client { Id = 3, Name = "Tim", ApproxAge = 30, AddOn = DateTime.Now }
            };
        modelBuilder.Entity<Client>().HasData(clients);

        modelBuilder.Entity<Distribution>().HasData(
            new { Id = 1, ClientId = clients[0].Id, GoodId = goods[0].Id, ShiftId = shift.Id, Quantity = 1, AddOn = DateTime.Now },
            new { Id = 2, ClientId = clients[0].Id, GoodId = goods[1].Id, ShiftId = shift.Id, Quantity = 2, AddOn = DateTime.Now },
            new { Id = 3, ClientId = clients[0].Id, GoodId = goods[3].Id, ShiftId = shift.Id, Quantity = 1, AddOn = DateTime.Now },
            new { Id = 4, ClientId = clients[1].Id, GoodId = goods[1].Id, ShiftId = shift.Id, Quantity = 1, AddOn = DateTime.Now },
            new { Id = 5, ClientId = clients[2].Id, GoodId = goods[0].Id, ShiftId = shift.Id, Quantity = 1, AddOn = DateTime.Now },
            new { Id = 6, ClientId = clients[2].Id, GoodId = goods[2].Id, ShiftId = shift.Id, Quantity = 2, AddOn = DateTime.Now },
            new { Id = 7, ClientId = clients[2].Id, GoodId = goods[6].Id, ShiftId = shift.Id, Quantity = 1, AddOn = DateTime.Now }
        );
    }

}

static class DbContextExtensions
{
    public static EntityTypeBuilder<TEntity> ConfigureBaseEntity<TEntity>(this EntityTypeBuilder<TEntity> modelBuilder) where TEntity : BaseEntity
    {
        modelBuilder.Property(x => x.Id).ValueGeneratedOnAdd();
        modelBuilder.Property(x => x.AddOn).ValueGeneratedOnAdd().HasDefaultValueSql("datetime()");
        modelBuilder.Property(x => x.ChangeOn).ValueGeneratedOnUpdate().HasDefaultValueSql("datetime()");

        return modelBuilder;
    }

    public static void RunMigrations<TContext>(this IApplicationBuilder app) where TContext : DbContext
    {
        using var scope = app.ApplicationServices.CreateScope();
        using var context = scope.ServiceProvider.GetRequiredService<TContext>();
        context?.Database.Migrate();
    }
}