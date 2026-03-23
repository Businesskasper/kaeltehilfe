using System.Net;
using System.Net.Http.Json;
using kaeltehilfe_backend.Features.Busses;
using kaeltehilfe_backend.Infrastructure.Auth;
using kaeltehilfe_backend.Models;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Moq;

namespace kaeltehilfe_test.Features.Busses;

[TestFixture]
public class BussesIntegrationTests : IntegrationTestBase
{
    private const string Url = "/api/busses";
    private Mock<IUserService> _userServiceMock = null!;

    private static BusCreateDto ValidBus(string reg = "UL-KH-001") => new()
    {
        RegistrationNumber = reg,
    };

    protected override void ConfigureServices(IServiceCollection services)
    {
        _userServiceMock = new Mock<IUserService>();

        // GetLogin returns null (no existing login) so Create proceeds to create one
        _userServiceMock
            .Setup(x => x.GetLogin(It.IsAny<string>()))
            .ReturnsAsync((Login?)null);

        _userServiceMock
            .Setup(x => x.CreateLogin(
                It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(),
                It.IsAny<string>(), It.IsAny<Role>(), It.IsAny<string?>(), It.IsAny<string?>()))
            .ReturnsAsync(new CreateUserResponse("idp-123", DateTime.UtcNow));

        _userServiceMock
            .Setup(x => x.DeleteLogin(It.IsAny<string>()))
            .Returns(Task.CompletedTask);

        services.RemoveAll<IUserService>();
        services.AddScoped(_ => _userServiceMock.Object);
    }

    [Test]
    public async Task Query_ReturnsEmptyList_WhenNoBusses()
    {
        var busses = await GetJsonAsync<List<BusDto>>(Url);

        Assert.That(busses, Is.Not.Null);
        Assert.That(busses, Is.Empty);
    }

    [Test]
    public async Task Create_Returns201_WithLocationHeader()
    {
        var response = await PostJsonAsync(Url, ValidBus());

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.Created));
        Assert.That(response.Headers.Location, Is.Not.Null);
    }

    [Test]
    public async Task GetById_ReturnsCreatedBus()
    {
        var id = await CreateAndGetId(Url, ValidBus());

        var bus = await GetJsonAsync<BusDto>($"{Url}/{id}");

        Assert.That(bus, Is.Not.Null);
        Assert.That(bus!.RegistrationNumber, Is.EqualTo("UL-KH-001"));
    }

    [Test]
    public async Task GetById_Returns404_WhenNotFound()
    {
        var response = await Client.GetAsync($"{Url}/999");

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.NotFound));
    }

    [Test]
    public async Task Put_UpdatesBus()
    {
        var id = await CreateAndGetId(Url, ValidBus());

        var putResponse = await PutJsonAsync($"{Url}/{id}", ValidBus("UL-KH-002"));
        Assert.That(putResponse.StatusCode, Is.EqualTo(HttpStatusCode.NoContent));

        var updated = await GetJsonAsync<BusDto>($"{Url}/{id}");
        Assert.That(updated!.RegistrationNumber, Is.EqualTo("UL-KH-002"));
    }

    [Test]
    public async Task Delete_SoftDeletes_BusNoLongerInQuery()
    {
        var id = await CreateAndGetId(Url, ValidBus());

        var deleteResponse = await Client.DeleteAsync($"{Url}/{id}");
        Assert.That(deleteResponse.StatusCode, Is.EqualTo(HttpStatusCode.NoContent));

        var busses = await GetJsonAsync<List<BusDto>>(Url);
        Assert.That(busses, Is.Empty);
    }

    [Test]
    public async Task Create_Returns400_WhenRegistrationTooShort()
    {
        var dto = ValidBus("AB");

        var response = await PostJsonAsync(Url, dto);

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));
    }

    [Test]
    public async Task Create_CallsUserService_ToCreateLogin()
    {
        await CreateAndGetId(Url, ValidBus("UL-KH-099"));

        _userServiceMock.Verify(x => x.CreateLogin(
            "ul-kh-099", // lowercase registration number
            It.IsAny<string>(),
            "Bus",
            "UL-KH-099",
            Role.OPERATOR,
            "UL-KH-099",
            null
        ), Times.Once);
    }

    [Test]
    public async Task Create_DuplicateRegistration_Returns400()
    {
        await CreateAndGetId(Url, ValidBus());

        var response = await PostJsonAsync(Url, ValidBus());

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));
    }
}
