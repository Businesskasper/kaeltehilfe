using System.Net;
using System.Net.Http.Json;
using kaeltehilfe_backend.Features.Volunteers;
using kaeltehilfe_backend.Models;

namespace kaeltehilfe_test.Features.Volunteers;

[TestFixture]
public class VolunteersIntegrationTests : IntegrationTestBase
{
    private const string Url = "/api/volunteers";

    private static VolunteerCreateDto ValidVolunteer(
        string first = "Hans", string last = "Müller") => new()
    {
        Firstname = first,
        Lastname = last,
        Gender = "MALE",
        IsDriver = true,
        Remarks = "Test volunteer",
    };

    [Test]
    public async Task Query_ReturnsEmptyList_WhenNoVolunteers()
    {
        var volunteers = await GetJsonAsync<List<VolunteerDto>>(Url);

        Assert.That(volunteers, Is.Not.Null);
        Assert.That(volunteers, Is.Empty);
    }

    [Test]
    public async Task Create_Returns201_WithLocationHeader()
    {
        var response = await PostJsonAsync(Url, ValidVolunteer());

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.Created));
        Assert.That(response.Headers.Location, Is.Not.Null);
    }

    [Test]
    public async Task GetById_ReturnsCreatedVolunteer()
    {
        var id = await CreateAndGetId(Url, ValidVolunteer());

        var volunteer = await GetJsonAsync<VolunteerDto>($"{Url}/{id}");

        Assert.That(volunteer, Is.Not.Null);
        Assert.That(volunteer!.Firstname, Is.EqualTo("Hans"));
        Assert.That(volunteer.Lastname, Is.EqualTo("Müller"));
        Assert.That(volunteer.Fullname, Is.EqualTo("Hans Müller"));
        Assert.That(volunteer.Gender, Is.EqualTo(Gender.MALE));
        Assert.That(volunteer.IsDriver, Is.True);
    }

    [Test]
    public async Task GetById_Returns404_WhenNotFound()
    {
        var response = await Client.GetAsync($"{Url}/999");

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.NotFound));
    }

    [Test]
    public async Task Put_UpdatesVolunteer()
    {
        var id = await CreateAndGetId(Url, ValidVolunteer());

        var updated = ValidVolunteer("Erika", "Schmidt");
        updated.Gender = "FEMALE";
        updated.IsDriver = false;

        var putResponse = await PutJsonAsync($"{Url}/{id}", updated);
        Assert.That(putResponse.StatusCode, Is.EqualTo(HttpStatusCode.NoContent));

        var result = await GetJsonAsync<VolunteerDto>($"{Url}/{id}");
        Assert.That(result!.Firstname, Is.EqualTo("Erika"));
        Assert.That(result.Lastname, Is.EqualTo("Schmidt"));
        Assert.That(result.Gender, Is.EqualTo(Gender.FEMALE));
        Assert.That(result.IsDriver, Is.False);
    }

    [Test]
    public async Task Delete_SoftDeletes_VolunteerNoLongerInQuery()
    {
        var id = await CreateAndGetId(Url, ValidVolunteer());

        var deleteResponse = await Client.DeleteAsync($"{Url}/{id}");
        Assert.That(deleteResponse.StatusCode, Is.EqualTo(HttpStatusCode.NoContent));

        var volunteers = await GetJsonAsync<List<VolunteerDto>>(Url);
        Assert.That(volunteers, Is.Empty);
    }

    [Test]
    public async Task Create_Returns400_WhenFirstnameTooShort()
    {
        var dto = ValidVolunteer("AB", "Müller");

        var response = await PostJsonAsync(Url, dto);

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));
    }

    [Test]
    public async Task Create_Returns400_WhenLastnameTooShort()
    {
        var dto = ValidVolunteer("Hans", "AB");

        var response = await PostJsonAsync(Url, dto);

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));
    }

    [Test]
    public async Task DuplicateName_Returns400_WithDuplicateCode()
    {
        await CreateAndGetId(Url, ValidVolunteer());

        var response = await PostJsonAsync(Url, ValidVolunteer());

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));
        var body = await response.Content.ReadAsStringAsync();
        Assert.That(body, Does.Contain("DUPLICATE"));
    }
}
