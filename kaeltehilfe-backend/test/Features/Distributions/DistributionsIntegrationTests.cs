using System.Net;
using System.Net.Http.Json;
using kaeltehilfe_backend.Features.BatchDistributions;
using kaeltehilfe_backend.Features.Busses;
using kaeltehilfe_backend.Features.Clients;
using kaeltehilfe_backend.Features.Distributions;
using kaeltehilfe_backend.Features.Goods;
using kaeltehilfe_backend.Infrastructure.Auth;
using kaeltehilfe_backend.Models;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Moq;

namespace kaeltehilfe_test.Features.Distributions;

[TestFixture]
public class DistributionsIntegrationTests : IntegrationTestBase
{
    private const string DistributionsUrl = "/api/distributions";
    private const string BatchUrl = "/api/batchdistributions";

    protected override void ConfigureServices(IServiceCollection services)
    {
        var userServiceMock = new Mock<IUserService>();
        userServiceMock.Setup(x => x.GetLogin(It.IsAny<string>())).ReturnsAsync((Login?)null);
        userServiceMock.Setup(x => x.CreateLogin(
                It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(),
                It.IsAny<string>(), It.IsAny<Role>(), It.IsAny<string?>(), It.IsAny<string?>()))
            .ReturnsAsync(new CreateUserResponse("idp-dist", DateTime.UtcNow));

        services.RemoveAll<IUserService>();
        services.AddScoped(_ => userServiceMock.Object);
    }

    private async Task<(string busReg, int goodId, int clientId)> SeedBaseData()
    {
        var busReg = "UL-DI-001";
        await CreateAndGetId("/api/busses", new BusCreateDto { RegistrationNumber = busReg });

        var goodId = await CreateAndGetId("/api/goods", new GoodCreateDto
        {
            Name = "Suppe",
            GoodType = GoodType.FOOD,
            Description = "A warm soup",
        });

        var clientId = await CreateAndGetId("/api/clients", new ClientCreateDto
        {
            Name = "Test Client",
            Gender = Gender.MALE,
            ApproxAge = 30,
            Remarks = "",
        });

        return (busReg, goodId, clientId);
    }

    private BatchDistributionCreateDto CreateBatchDto(
        string busReg, int goodId, string clientName = "Test Client", int? clientId = null)
    {
        return new BatchDistributionCreateDto
        {
            LocationName = "Bahnhof",
            GeoLocation = new GeoLocationDto { Lat = 48.4, Lng = 9.99 },
            BusRegistrationNumber = busReg,
            Clients =
            [
                new BatchDistributionClientDto
                {
                    Id = clientId,
                    Name = clientName,
                    Gender = Gender.MALE,
                    ApproxAge = 30,
                },
            ],
            Goods =
            [
                new BatchDistributionGoodDto { Id = goodId, Quantity = 2 },
            ],
        };
    }

    [Test]
    public async Task Query_ReturnsEmptyList_WhenNoDistributions()
    {
        var distributions = await GetJsonAsync<List<DistributionDto>>(DistributionsUrl);

        Assert.That(distributions, Is.Not.Null);
        Assert.That(distributions, Is.Empty);
    }

    [Test]
    public async Task BatchCreate_Returns200_AndCreatesDistributions()
    {
        var (busReg, goodId, clientId) = await SeedBaseData();
        var dto = CreateBatchDto(busReg, goodId, "Test Client", clientId);

        var response = await PostJsonAsync(BatchUrl, dto);
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));

        var distributions = await GetJsonAsync<List<DistributionDto>>(DistributionsUrl);
        Assert.That(distributions, Has.Count.EqualTo(1));
        Assert.That(distributions![0].Good!.Name, Is.EqualTo("Suppe"));
        Assert.That(distributions[0].Client!.Name, Is.EqualTo("Test Client"));
        Assert.That(distributions[0].Quantity, Is.EqualTo(2));
        Assert.That(distributions[0].LocationName, Is.EqualTo("Bahnhof"));
    }

    [Test]
    public async Task BatchCreate_CreatesNewClient_WhenNoIdProvided()
    {
        var (busReg, goodId, _) = await SeedBaseData();
        var dto = CreateBatchDto(busReg, goodId, "New Person");

        var response = await PostJsonAsync(BatchUrl, dto);
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));

        // The new client should appear in distributions
        var distributions = await GetJsonAsync<List<DistributionDto>>(DistributionsUrl);
        Assert.That(distributions![0].Client!.Name, Is.EqualTo("New Person"));

        // And in the clients list
        var clients = await GetJsonAsync<List<ClientDto>>("/api/clients");
        Assert.That(clients!.Any(c => c.Name == "New Person"), Is.True);
    }

    [Test]
    public async Task BatchCreate_MultipleClientsAndGoods_CreatesCartesianProduct()
    {
        var (busReg, goodId1, clientId) = await SeedBaseData();
        var goodId2 = await CreateAndGetId("/api/goods", new GoodCreateDto
        {
            Name = "Kaffee",
            GoodType = GoodType.FOOD,
            Description = "Hot coffee",
        });

        var dto = new BatchDistributionCreateDto
        {
            LocationName = "Bahnhof",
            GeoLocation = new GeoLocationDto { Lat = 48.4, Lng = 9.99 },
            BusRegistrationNumber = busReg,
            Clients =
            [
                new BatchDistributionClientDto { Id = clientId, Name = "Test Client", Gender = Gender.MALE, ApproxAge = 30 },
                new BatchDistributionClientDto { Name = "Second Client", Gender = Gender.FEMALE, ApproxAge = 25 },
            ],
            Goods =
            [
                new BatchDistributionGoodDto { Id = goodId1, Quantity = 1 },
                new BatchDistributionGoodDto { Id = goodId2, Quantity = 3 },
            ],
        };

        var response = await PostJsonAsync(BatchUrl, dto);
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));

        // 2 clients × 2 goods = 4 distributions
        var distributions = await GetJsonAsync<List<DistributionDto>>(DistributionsUrl);
        Assert.That(distributions, Has.Count.EqualTo(4));
    }

    [Test]
    public async Task GetById_ReturnsDistribution()
    {
        var (busReg, goodId, clientId) = await SeedBaseData();
        var dto = CreateBatchDto(busReg, goodId, "Test Client", clientId);
        await PostJsonAsync(BatchUrl, dto);

        var distributions = await GetJsonAsync<List<DistributionDto>>(DistributionsUrl);
        var id = distributions![0].Id;

        var dist = await GetJsonAsync<DistributionDto>($"{DistributionsUrl}/{id}");
        Assert.That(dist, Is.Not.Null);
        Assert.That(dist!.Id, Is.EqualTo(id));
    }

    [Test]
    public async Task Patch_UpdatesQuantity()
    {
        var (busReg, goodId, clientId) = await SeedBaseData();
        await PostJsonAsync(BatchUrl, CreateBatchDto(busReg, goodId, "Test Client", clientId));

        var distributions = await GetJsonAsync<List<DistributionDto>>(DistributionsUrl);
        var id = distributions![0].Id;

        var patchResponse = await PatchJsonAsync(
            $"{DistributionsUrl}/{id}",
            new DistributionUpdateDto { Quantity = 5 });
        Assert.That(patchResponse.StatusCode, Is.EqualTo(HttpStatusCode.NoContent));

        var updated = await GetJsonAsync<DistributionDto>($"{DistributionsUrl}/{id}");
        Assert.That(updated!.Quantity, Is.EqualTo(5));
    }

    [Test]
    public async Task Patch_Returns400_WhenQuantityIsZero()
    {
        var (busReg, goodId, clientId) = await SeedBaseData();
        await PostJsonAsync(BatchUrl, CreateBatchDto(busReg, goodId, "Test Client", clientId));

        var distributions = await GetJsonAsync<List<DistributionDto>>(DistributionsUrl);
        var id = distributions![0].Id;

        var response = await PatchJsonAsync(
            $"{DistributionsUrl}/{id}",
            new DistributionUpdateDto { Quantity = 0 });
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));
    }

    [Test]
    public async Task Delete_SoftDeletes_DistributionNoLongerInQuery()
    {
        var (busReg, goodId, clientId) = await SeedBaseData();
        await PostJsonAsync(BatchUrl, CreateBatchDto(busReg, goodId, "Test Client", clientId));

        var distributions = await GetJsonAsync<List<DistributionDto>>(DistributionsUrl);
        var id = distributions![0].Id;

        var deleteResponse = await Client.DeleteAsync($"{DistributionsUrl}/{id}");
        Assert.That(deleteResponse.StatusCode, Is.EqualTo(HttpStatusCode.NoContent));

        var remaining = await GetJsonAsync<List<DistributionDto>>(DistributionsUrl);
        Assert.That(remaining, Is.Empty);
    }

    [Test]
    public async Task Delete_Returns404_WhenNotFound()
    {
        var response = await Client.DeleteAsync($"{DistributionsUrl}/999");

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.NotFound));
    }

    [Test]
    public async Task BatchCreate_Returns400_WhenLocationEmpty()
    {
        var (busReg, goodId, clientId) = await SeedBaseData();
        var dto = CreateBatchDto(busReg, goodId, "Test Client", clientId);
        dto.LocationName = "";

        var response = await PostJsonAsync(BatchUrl, dto);

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));
    }

    [Test]
    public async Task BatchCreate_Returns400_WhenBusRegistrationTooShort()
    {
        var dto = new BatchDistributionCreateDto
        {
            LocationName = "Bahnhof",
            GeoLocation = new GeoLocationDto { Lat = 48.4, Lng = 9.99 },
            BusRegistrationNumber = "AB",
            Clients = [new BatchDistributionClientDto { Name = "X", Gender = Gender.MALE, ApproxAge = 30 }],
            Goods = [new BatchDistributionGoodDto { Id = 1, Quantity = 1 }],
        };

        var response = await PostJsonAsync(BatchUrl, dto);

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));
    }
}
