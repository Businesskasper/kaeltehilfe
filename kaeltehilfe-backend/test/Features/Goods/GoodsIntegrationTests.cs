using System.Net;
using System.Net.Http.Json;
using kaeltehilfe_backend.Features.Goods;
using kaeltehilfe_backend.Models;

namespace kaeltehilfe_test.Features.Goods;

[TestFixture]
public class GoodsIntegrationTests : IntegrationTestBase
{
    private const string Url = "/api/goods";

    private static GoodCreateDto ValidGood(string name = "Suppe") => new()
    {
        Name = name,
        GoodType = GoodType.FOOD,
        Description = "A warm soup",
        Tags = ["Heißgetränk"],
    };

    [Test]
    public async Task Query_ReturnsEmptyList_WhenNoGoods()
    {
        var goods = await GetJsonAsync<List<GoodDto>>(Url);

        Assert.That(goods, Is.Not.Null);
        Assert.That(goods, Is.Empty);
    }

    [Test]
    public async Task Create_Returns201_WithLocationHeader()
    {
        var response = await PostJsonAsync(Url, ValidGood());

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.Created));
        Assert.That(response.Headers.Location, Is.Not.Null);
    }

    [Test]
    public async Task GetById_ReturnsCreatedGood()
    {
        var id = await CreateAndGetId(Url, ValidGood());

        var good = await GetJsonAsync<GoodDto>($"{Url}/{id}");

        Assert.That(good, Is.Not.Null);
        Assert.That(good!.Name, Is.EqualTo("Suppe"));
        Assert.That(good.GoodType, Is.EqualTo(GoodType.FOOD));
    }

    [Test]
    public async Task GetById_Returns404_WhenNotFound()
    {
        var response = await Client.GetAsync($"{Url}/999");

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.NotFound));
    }

    [Test]
    public async Task Put_UpdatesGood()
    {
        var id = await CreateAndGetId(Url, ValidGood());

        var updateDto = ValidGood("Kaffee");
        updateDto.GoodType = GoodType.CONSUMABLE;
        var putResponse = await PutJsonAsync($"{Url}/{id}", updateDto);
        Assert.That(putResponse.StatusCode, Is.EqualTo(HttpStatusCode.NoContent));

        var updated = await GetJsonAsync<GoodDto>($"{Url}/{id}");
        Assert.That(updated!.Name, Is.EqualTo("Kaffee"));
        Assert.That(updated.GoodType, Is.EqualTo(GoodType.CONSUMABLE));
    }

    [Test]
    public async Task Put_Returns404_WhenNotFound()
    {
        var response = await PutJsonAsync($"{Url}/999", ValidGood());

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.NotFound));
    }

    [Test]
    public async Task Delete_SoftDeletes_GoodNoLongerInQuery()
    {
        var id = await CreateAndGetId(Url, ValidGood());

        var deleteResponse = await Client.DeleteAsync($"{Url}/{id}");
        Assert.That(deleteResponse.StatusCode, Is.EqualTo(HttpStatusCode.NoContent));

        var goods = await GetJsonAsync<List<GoodDto>>(Url);
        Assert.That(goods, Is.Empty);
    }

    [Test]
    public async Task Delete_Returns404_WhenNotFound()
    {
        var response = await Client.DeleteAsync($"{Url}/999");

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.NotFound));
    }

    [Test]
    public async Task Create_Returns400_WhenNameTooShort()
    {
        var dto = ValidGood("AB"); // MinimumLength(3) fails

        var response = await PostJsonAsync(Url, dto);

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));
    }

    [Test]
    public async Task Create_Returns400_WhenNameIsNull()
    {
        var dto = new GoodCreateDto { GoodType = GoodType.FOOD };

        var response = await PostJsonAsync(Url, dto);

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));
    }

    [Test]
    public async Task Query_ReturnsMultipleGoods()
    {
        await CreateAndGetId(Url, ValidGood("Suppe"));
        await CreateAndGetId(Url, ValidGood("Kaffee"));
        await CreateAndGetId(Url, ValidGood("Tee"));

        var goods = await GetJsonAsync<List<GoodDto>>(Url);

        Assert.That(goods, Has.Count.EqualTo(3));
    }

    [Test]
    public async Task DuplicateName_Returns400_WithDuplicateCode()
    {
        await CreateAndGetId(Url, ValidGood("Suppe"));

        var response = await PostJsonAsync(Url, ValidGood("Suppe"));

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));
        var body = await response.Content.ReadAsStringAsync();
        Assert.That(body, Does.Contain("DUPLICATE"));
    }
}
