public static class ConfigurationExtensions
{
    public static string RequireConfigValue(this IConfiguration configuration, string key)
    {
        return configuration[key] ?? throw new Exception($"{key} is not defined in appsettings");
    }
}
