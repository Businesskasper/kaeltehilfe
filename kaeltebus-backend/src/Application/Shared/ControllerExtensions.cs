
using System.Text.Json;

public static class ControllerExtensions
{
    public static async Task<Dictionary<string, object?>> GetUpdatedFields<TData>(this Stream body)
    {
        var result = new Dictionary<string, object?>(); ;

        body.Position = 0;
        var json = await JsonSerializer.DeserializeAsync<Dictionary<string, object>>(body);
        if (json is null) return result;

        var properties = typeof(TData).GetProperties();

        foreach (var property in properties)
        {
            var jsonKey = $"{property.Name[0].ToString().ToLower()}{property.Name[1..property.Name.Length]}";
            if (!json.ContainsKey(jsonKey)) continue;

            // var value = ParseValue((JsonElement)json[jsonKey]);
            var value = json[jsonKey].ToString();
            result.Add(property.Name, value);
        }

        return result;
    }
    public static TCreateDto getUpdated<TCreateDto, TUpdateDto>(TCreateDto existing, TUpdateDto update)
    {
        var updated = Activator.CreateInstance<TCreateDto>();
        var properties = existing?.GetType().GetProperties();
        foreach (var property in properties ?? [])
        {
            property.SetValue(updated, property.GetValue(update) ?? property.GetValue(existing));
        }

        return updated;
    }
}