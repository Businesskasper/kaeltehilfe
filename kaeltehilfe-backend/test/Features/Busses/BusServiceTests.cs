using kaeltehilfe_backend.Features.Busses;
using kaeltehilfe_backend.Infrastructure.Auth;
using kaeltehilfe_backend.Infrastructure.Database;
using kaeltehilfe_backend.Models;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;

namespace kaeltehilfe_test.Features.Busses;

[TestFixture]
public class BusServiceTests
{
    private SqliteConnection _connection = null!;
    private KbContext _db = null!;
    private Mock<IUserService> _userService = null!;
    private BusService _sut = null!;

    [SetUp]
    public void SetUp()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();

        var options = new DbContextOptionsBuilder<KbContext>()
            .UseSqlite(_connection, x => x.UseNetTopologySuite())
            .Options;

        _db = new KbContext(options);
        _db.Database.EnsureCreated();

        _userService = new Mock<IUserService>();
        _sut = new BusService(_db, _userService.Object, NullLogger<BusService>.Instance);
    }

    [TearDown]
    public void TearDown()
    {
        _db.Dispose();
        _connection.Close();
        _connection.Dispose();
    }

    // ── CreateBusWithLogin ──────────────────────────────────────────────────

    [Test]
    public async Task CreateBusWithLogin_AddsBusToContext()
    {
        _userService.Setup(x => x.GetLogin(It.IsAny<string>())).ReturnsAsync((Login?)null);
        _userService.Setup(x => x.CreateLogin(
            It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(),
            It.IsAny<string>(), It.IsAny<Role>(), It.IsAny<string?>(), It.IsAny<string?>()))
            .ReturnsAsync(new CreateUserResponse("idp-1", DateTime.UtcNow));

        var bus = await _sut.CreateBusWithLogin("UL-KH-001");
        await _db.SaveChangesAsync();

        Assert.That(bus.RegistrationNumber, Is.EqualTo("UL-KH-001"));
        Assert.That(await _db.Busses.CountAsync(), Is.EqualTo(1));
    }

    [Test]
    public async Task CreateBusWithLogin_CreatesOperatorLoginInKeycloakAndDb_WhenNoExistingLogin()
    {
        _userService.Setup(x => x.GetLogin("ul-kh-001")).ReturnsAsync((Login?)null);
        _userService.Setup(x => x.CreateLogin(
            It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(),
            It.IsAny<string>(), It.IsAny<Role>(), It.IsAny<string?>(), It.IsAny<string?>()))
            .ReturnsAsync(new CreateUserResponse("idp-1", DateTime.UtcNow));

        await _sut.CreateBusWithLogin("UL-KH-001");
        await _db.SaveChangesAsync();

        _userService.Verify(x => x.CreateLogin(
            "ul-kh-001",
            "UL-KH-001@kaelte-hilfe.de",
            "Bus",
            "UL-KH-001",
            Role.OPERATOR,
            "UL-KH-001",
            null
        ), Times.Once);

        Assert.That(await _db.Logins.CountAsync(), Is.EqualTo(1));
        var dbLogin = await _db.Logins.FirstAsync();
        Assert.That(dbLogin, Is.InstanceOf<OperatorLogin>());
        Assert.That(dbLogin.Username, Is.EqualTo("ul-kh-001"));
    }

    [Test]
    public async Task CreateBusWithLogin_SkipsLoginCreation_WhenLoginAlreadyExistsInKeycloak()
    {
        var existingLogin = new OperatorLogin
        {
            Username = "ul-kh-001",
            RegistrationNumber = "UL-KH-001",
            IdentityProviderId = "idp-existing",
            Email = "ul-kh-001@kaelte-hilfe.de",
        };
        _userService.Setup(x => x.GetLogin("ul-kh-001")).ReturnsAsync(existingLogin);

        await _sut.CreateBusWithLogin("UL-KH-001");
        await _db.SaveChangesAsync();

        _userService.Verify(x => x.CreateLogin(
            It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(),
            It.IsAny<string>(), It.IsAny<Role>(), It.IsAny<string?>(), It.IsAny<string?>()),
            Times.Never);

        // No DB login added (Keycloak already has it; sync via LoginInitializer handles DB)
        Assert.That(await _db.Logins.CountAsync(), Is.EqualTo(0));
    }

    // ── DeleteBusWithLogin ──────────────────────────────────────────────────

    [Test]
    public async Task DeleteBusWithLogin_SoftDeletesBus()
    {
        var bus = await SeedBusAsync("UL-KH-001");
        _userService.Setup(x => x.GetLogin(It.IsAny<string>())).ReturnsAsync((Login?)null);

        await _sut.DeleteBusWithLogin(bus);
        await _db.SaveChangesAsync();

        Assert.That(bus.IsDeleted, Is.True);
    }

    [Test]
    public async Task DeleteBusWithLogin_DeletesKeycloakLogin_WhenItExists()
    {
        var bus = await SeedBusAsync("UL-KH-001");
        var authLogin = new OperatorLogin { IdentityProviderId = "idp-1", Username = "ul-kh-001", RegistrationNumber = "UL-KH-001" };
        _userService.Setup(x => x.GetLogin("ul-kh-001")).ReturnsAsync(authLogin);
        _userService.Setup(x => x.DeleteLogin("idp-1")).Returns(Task.CompletedTask);

        await _sut.DeleteBusWithLogin(bus);

        _userService.Verify(x => x.DeleteLogin("idp-1"), Times.Once);
    }

    [Test]
    public async Task DeleteBusWithLogin_DeletesDbLogin_WhenKeycloakLoginExists()
    {
        var bus = await SeedBusAsync("UL-KH-001");
        await SeedDbLoginAsync("ul-kh-001");

        var authLogin = new OperatorLogin { IdentityProviderId = "idp-1", Username = "ul-kh-001", RegistrationNumber = "UL-KH-001" };
        _userService.Setup(x => x.GetLogin("ul-kh-001")).ReturnsAsync(authLogin);
        _userService.Setup(x => x.DeleteLogin(It.IsAny<string>())).Returns(Task.CompletedTask);

        await _sut.DeleteBusWithLogin(bus);
        await _db.SaveChangesAsync();

        Assert.That(await _db.Logins.CountAsync(), Is.EqualTo(0));
    }

    [Test]
    public async Task DeleteBusWithLogin_DeletesDbLogin_EvenWhenKeycloakLoginNotFound()
    {
        // This is the bug scenario: Keycloak login is gone (e.g. manually removed),
        // but the local DB login must still be cleaned up.
        var bus = await SeedBusAsync("UL-KH-001");
        await SeedDbLoginAsync("ul-kh-001");

        _userService.Setup(x => x.GetLogin("ul-kh-001")).ReturnsAsync((Login?)null);

        await _sut.DeleteBusWithLogin(bus);
        await _db.SaveChangesAsync();

        _userService.Verify(x => x.DeleteLogin(It.IsAny<string>()), Times.Never);
        Assert.That(await _db.Logins.CountAsync(), Is.EqualTo(0));
    }

    [Test]
    public async Task DeleteBusWithLogin_DoesNotThrow_WhenBothLoginsAreMissing()
    {
        var bus = await SeedBusAsync("UL-KH-001");
        _userService.Setup(x => x.GetLogin(It.IsAny<string>())).ReturnsAsync((Login?)null);

        Assert.DoesNotThrowAsync(async () =>
        {
            await _sut.DeleteBusWithLogin(bus);
            await _db.SaveChangesAsync();
        });
    }

    // ── EnsureBusExists ─────────────────────────────────────────────────────

    [Test]
    public async Task EnsureBusExists_AddsBus_WhenNotPresent()
    {
        await _sut.EnsureBusExists("UL-KH-001");
        await _db.SaveChangesAsync();

        Assert.That(await _db.Busses.CountAsync(), Is.EqualTo(1));
        var bus = await _db.Busses.FirstAsync();
        Assert.That(bus.RegistrationNumber, Is.EqualTo("UL-KH-001"));
    }

    [Test]
    public async Task EnsureBusExists_DoesNotAddDuplicate_WhenAlreadyPresent()
    {
        await SeedBusAsync("UL-KH-001");

        await _sut.EnsureBusExists("UL-KH-001");
        await _db.SaveChangesAsync();

        Assert.That(await _db.Busses.CountAsync(), Is.EqualTo(1));
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private async Task<Bus> SeedBusAsync(string registrationNumber)
    {
        var bus = new Bus { RegistrationNumber = registrationNumber };
        await _db.Busses.AddAsync(bus);
        await _db.SaveChangesAsync();
        return bus;
    }

    private async Task SeedDbLoginAsync(string username)
    {
        await _db.Logins.AddAsync(new OperatorLogin
        {
            Username = username,
            RegistrationNumber = username.ToUpper(),
            IdentityProviderId = $"idp-{username}",
            Email = $"{username}@kaelte-hilfe.de",
            CreateOn = DateTime.UtcNow,
        });
        await _db.SaveChangesAsync();
    }
}
