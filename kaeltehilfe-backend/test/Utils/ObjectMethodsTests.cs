using System.Text.Json;

namespace kaeltehilfe_test.Utils;

[TestFixture]
public class ObjectMethodsTests
{
    private class SampleDto
    {
        public string? Name { get; set; }
        public int? Age { get; set; }
        public string? Description { get; set; }
    }

    [Test]
    public void GetUpdated_FallsBackToExisting_WhenNewInstancePropertyIsNull()
    {
        // getUpdated creates a new TCreateDto instance and checks if its properties are non-null.
        // If a property on the new instance is null, it falls back to the existing value.
        // Note: it reads from the new blank instance, NOT from the update parameter.
        var existing = new SampleDto { Name = "Old", Age = 30, Description = "Desc" };
        var update = new SampleDto { Name = "New", Age = 99, Description = null };

        var result = ObjectMethods.getUpdated(existing, update);

        // All null on the new instance -> all fall back to existing
        Assert.That(result.Name, Is.EqualTo("Old"));
        Assert.That(result.Age, Is.EqualTo(30));
        Assert.That(result.Description, Is.EqualTo("Desc"));
    }

    [Test]
    public void GetUpdated_ReturnsExistingValues_WhenUpdateIsAllNull()
    {
        var existing = new SampleDto { Name = "Keep", Age = 25, Description = "Keep this" };
        var update = new SampleDto();

        var result = ObjectMethods.getUpdated(existing, update);

        Assert.That(result.Name, Is.EqualTo("Keep"));
        Assert.That(result.Age, Is.EqualTo(25));
        Assert.That(result.Description, Is.EqualTo("Keep this"));
    }

    [Test]
    public void GetJsonElementValue_HandlesAllTypes()
    {
        var json = JsonSerializer.Deserialize<JsonElement>("""
            {
                "str": "hello",
                "num": 42,
                "float": 3.14,
                "boolTrue": true,
                "boolFalse": false,
                "nullVal": null,
                "arr": [1, 2],
                "obj": {"a": 1}
            }
        """);

        Assert.That(ObjectMethods.GetJsonElementValue(json.GetProperty("str")), Is.EqualTo("hello"));
        Assert.That(ObjectMethods.GetJsonElementValue(json.GetProperty("num")), Is.EqualTo(42L));
        Assert.That(ObjectMethods.GetJsonElementValue(json.GetProperty("float")), Is.EqualTo(3.14));
        Assert.That(ObjectMethods.GetJsonElementValue(json.GetProperty("boolTrue")), Is.True);
        Assert.That(ObjectMethods.GetJsonElementValue(json.GetProperty("boolFalse")), Is.False);
        Assert.That(ObjectMethods.GetJsonElementValue(json.GetProperty("nullVal")), Is.Null);
        // Array and Object return JsonElement
        Assert.That(ObjectMethods.GetJsonElementValue(json.GetProperty("arr")), Is.InstanceOf<JsonElement>());
        Assert.That(ObjectMethods.GetJsonElementValue(json.GetProperty("obj")), Is.InstanceOf<JsonElement>());
    }

    [Test]
    public async Task GetUpdatedFields_ExtractsOnlySubmittedFields()
    {
        var jsonBody = """{"name": "Updated", "age": 25}""";
        var stream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(jsonBody));

        var fields = await stream.GetUpdatedFields<SampleDto>();

        Assert.That(fields, Has.Count.EqualTo(2));
        Assert.That(fields.ContainsKey("Name"), Is.True);
        Assert.That(fields["Name"]?.ToString(), Is.EqualTo("Updated"));
        Assert.That(fields.ContainsKey("Age"), Is.True);
    }

    [Test]
    public async Task GetUpdatedFields_IgnoresUnknownFields()
    {
        var jsonBody = """{"name": "Value", "unknownField": "ignored"}""";
        var stream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(jsonBody));

        var fields = await stream.GetUpdatedFields<SampleDto>();

        Assert.That(fields, Has.Count.EqualTo(1));
        Assert.That(fields.ContainsKey("Name"), Is.True);
    }

    [Test]
    public async Task GetUpdatedFields_ReturnsEmpty_WhenBodyIsEmpty()
    {
        var stream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes("{}"));

        var fields = await stream.GetUpdatedFields<SampleDto>();

        Assert.That(fields, Is.Empty);
    }
}
