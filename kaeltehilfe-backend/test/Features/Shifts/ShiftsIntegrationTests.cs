using System.Net;
using System.Net.Http.Json;
using kaeltehilfe_backend.Features.Busses;
using kaeltehilfe_backend.Features.Shifts;
using kaeltehilfe_backend.Features.Volunteers;
using kaeltehilfe_backend.Infrastructure.Auth;
using kaeltehilfe_backend.Models;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Moq;

namespace kaeltehilfe_test.Features.Shifts;

[TestFixture]
public class ShiftsIntegrationTests : IntegrationTestBase
{
    private const string ShiftsUrl = "/api/shifts";
    private const string BussesUrl = "/api/busses";
    private const string VolunteersUrl = "/api/volunteers";

    protected override void ConfigureServices(IServiceCollection services)
    {
        var userServiceMock = new Mock<IUserService>();
        userServiceMock.Setup(x => x.GetLogin(It.IsAny<string>())).ReturnsAsync((Login?)null);
        userServiceMock.Setup(x => x.CreateLogin(
                It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(),
                It.IsAny<string>(), It.IsAny<Role>(), It.IsAny<string?>(), It.IsAny<string?>()))
            .ReturnsAsync(new CreateUserResponse("idp-shift", DateTime.UtcNow));

        services.RemoveAll<IUserService>();
        services.AddScoped(_ => userServiceMock.Object);
    }

    private async Task<int> SeedBus(string reg = "UL-SH-001")
    {
        return await CreateAndGetId(BussesUrl, new BusCreateDto { RegistrationNumber = reg });
    }

    private async Task<int> SeedVolunteer(string first = "Hans", string last = "Müller")
    {
        return await CreateAndGetId(VolunteersUrl, new VolunteerCreateDto
        {
            Firstname = first,
            Lastname = last,
            Gender = "MALE",
            IsDriver = true,
            Remarks = "",
        });
    }

    [Test]
    public async Task Query_ReturnsEmptyList_WhenNoShifts()
    {
        var shifts = await GetJsonAsync<List<ShiftDto>>(ShiftsUrl);

        Assert.That(shifts, Is.Not.Null);
        Assert.That(shifts, Is.Empty);
    }

    [Test]
    public async Task Create_Returns201_WithBusAndVolunteers()
    {
        var busId = await SeedBus();
        var vol1Id = await SeedVolunteer("Anna", "Schmidt");
        var vol2Id = await SeedVolunteer("Peter", "Wagner");

        var dto = new ShiftCreateDto
        {
            BusId = busId,
            Date = new DateOnly(2026, 3, 23),
            Volunteers = [
                new ShiftCreateVolunteerDto { Id = vol1Id },
                new ShiftCreateVolunteerDto { Id = vol2Id },
            ],
        };

        var response = await PostJsonAsync(ShiftsUrl, dto);
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.Created));

        var location = response.Headers.Location!.ToString();
        var id = int.Parse(location.Split('/').Last());

        var shift = await GetJsonAsync<ShiftDto>($"{ShiftsUrl}/{id}");
        Assert.That(shift, Is.Not.Null);
        Assert.That(shift!.BusId, Is.EqualTo(busId));
        Assert.That(shift.Date, Is.EqualTo(new DateOnly(2026, 3, 23)));
        Assert.That(shift.Volunteers, Has.Count.EqualTo(2));
    }

    [Test]
    public async Task GetById_Returns404_WhenNotFound()
    {
        var response = await Client.GetAsync($"{ShiftsUrl}/999");

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.NotFound));
    }

    [Test]
    public async Task Put_UpdatesShift()
    {
        var busId = await SeedBus();
        var vol1Id = await SeedVolunteer("Anna", "Schmidt");

        var createDto = new ShiftCreateDto
        {
            BusId = busId,
            Date = new DateOnly(2026, 3, 23),
            Volunteers = [new ShiftCreateVolunteerDto { Id = vol1Id }],
        };
        var id = await CreateAndGetId(ShiftsUrl, createDto);

        var vol2Id = await SeedVolunteer("Peter", "Wagner");
        var updateDto = new ShiftCreateDto
        {
            BusId = busId,
            Date = new DateOnly(2026, 3, 24),
            Volunteers = [
                new ShiftCreateVolunteerDto { Id = vol1Id },
                new ShiftCreateVolunteerDto { Id = vol2Id },
            ],
        };

        var putResponse = await PutJsonAsync($"{ShiftsUrl}/{id}", updateDto);
        Assert.That(putResponse.StatusCode, Is.EqualTo(HttpStatusCode.NoContent));

        var updated = await GetJsonAsync<ShiftDto>($"{ShiftsUrl}/{id}");
        Assert.That(updated!.Date, Is.EqualTo(new DateOnly(2026, 3, 24)));
        Assert.That(updated.Volunteers, Has.Count.EqualTo(2));
    }

    [Test]
    public async Task Delete_SoftDeletes_ShiftNoLongerInQuery()
    {
        var busId = await SeedBus();
        var createDto = new ShiftCreateDto
        {
            BusId = busId,
            Date = new DateOnly(2026, 3, 23),
            Volunteers = [],
        };
        var id = await CreateAndGetId(ShiftsUrl, createDto);

        var deleteResponse = await Client.DeleteAsync($"{ShiftsUrl}/{id}");
        Assert.That(deleteResponse.StatusCode, Is.EqualTo(HttpStatusCode.NoContent));

        var shifts = await GetJsonAsync<List<ShiftDto>>(ShiftsUrl);
        Assert.That(shifts, Is.Empty);
    }

    [Test]
    public async Task Create_Returns400_WhenDateMissing()
    {
        var busId = await SeedBus();
        var dto = new ShiftCreateDto
        {
            BusId = busId,
            Date = null,
            Volunteers = [],
        };

        var response = await PostJsonAsync(ShiftsUrl, dto);

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));
    }

    [Test]
    public async Task Create_Returns400_WhenDuplicateVolunteers()
    {
        var busId = await SeedBus();
        var volId = await SeedVolunteer();

        var dto = new ShiftCreateDto
        {
            BusId = busId,
            Date = new DateOnly(2026, 3, 23),
            Volunteers = [
                new ShiftCreateVolunteerDto { Id = volId },
                new ShiftCreateVolunteerDto { Id = volId },
            ],
        };

        var response = await PostJsonAsync(ShiftsUrl, dto);

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));
    }
}
