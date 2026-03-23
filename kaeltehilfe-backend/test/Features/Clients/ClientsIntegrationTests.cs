using System.Net;
using System.Net.Http.Json;
using kaeltehilfe_backend.Features.Clients;
using kaeltehilfe_backend.Models;

namespace kaeltehilfe_test.Features.Clients;

[TestFixture]
public class ClientsIntegrationTests : IntegrationTestBase
{
    private const string Url = "/api/clients";

    private static ClientCreateDto ValidClient(string name = "Max Mustermann") => new()
    {
        Name = name,
        Gender = Gender.MALE,
        ApproxAge = 35,
        Remarks = "Test client",
    };

    [Test]
    public async Task Query_ReturnsEmptyList_WhenNoClients()
    {
        var clients = await GetJsonAsync<List<ClientDto>>(Url);

        Assert.That(clients, Is.Not.Null);
        Assert.That(clients, Is.Empty);
    }

    [Test]
    public async Task Create_Returns201_WithLocationHeader()
    {
        var response = await PostJsonAsync(Url, ValidClient());

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.Created));
        Assert.That(response.Headers.Location, Is.Not.Null);
    }

    [Test]
    public async Task GetById_ReturnsCreatedClient()
    {
        var id = await CreateAndGetId(Url, ValidClient());

        var client = await GetJsonAsync<ClientDto>($"{Url}/{id}");

        Assert.That(client, Is.Not.Null);
        Assert.That(client!.Name, Is.EqualTo("Max Mustermann"));
        Assert.That(client.Gender, Is.EqualTo(Gender.MALE));
        Assert.That(client.ApproxAge, Is.EqualTo(35));
    }

    [Test]
    public async Task GetById_Returns404_WhenNotFound()
    {
        var response = await Client.GetAsync($"{Url}/999");

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.NotFound));
    }

    [Test]
    public async Task Put_UpdatesClient()
    {
        var id = await CreateAndGetId(Url, ValidClient());

        var updateDto = ValidClient("Erika Musterfrau");
        updateDto.Gender = Gender.FEMALE;
        updateDto.ApproxAge = 28;

        var putResponse = await PutJsonAsync($"{Url}/{id}", updateDto);
        Assert.That(putResponse.StatusCode, Is.EqualTo(HttpStatusCode.NoContent));

        var updated = await GetJsonAsync<ClientDto>($"{Url}/{id}");
        Assert.That(updated!.Name, Is.EqualTo("Erika Musterfrau"));
        Assert.That(updated.Gender, Is.EqualTo(Gender.FEMALE));
        Assert.That(updated.ApproxAge, Is.EqualTo(28));
    }

    [Test]
    public async Task Delete_SoftDeletes_ClientNoLongerInQuery()
    {
        var id = await CreateAndGetId(Url, ValidClient());

        var deleteResponse = await Client.DeleteAsync($"{Url}/{id}");
        Assert.That(deleteResponse.StatusCode, Is.EqualTo(HttpStatusCode.NoContent));

        var clients = await GetJsonAsync<List<ClientDto>>(Url);
        Assert.That(clients, Is.Empty);
    }

    [Test]
    public async Task Create_Returns400_WhenNameTooShort()
    {
        var dto = ValidClient("AB");

        var response = await PostJsonAsync(Url, dto);

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));
    }

    [Test]
    public async Task Create_Returns400_WhenRequiredFieldsMissing()
    {
        var dto = new ClientCreateDto { Name = "Valid Name" };

        var response = await PostJsonAsync(Url, dto);

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));
    }

    [Test]
    public async Task Create_Returns400_WhenAgeOutOfRange()
    {
        var dto = ValidClient();
        dto.ApproxAge = 200; // InclusiveBetween(0, 100)

        var response = await PostJsonAsync(Url, dto);

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));
    }
}
