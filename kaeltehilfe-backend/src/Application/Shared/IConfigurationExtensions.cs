using System;
using System.IO;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

public static class ConfigurationExtensions
{
    public static string RequireConfigValue(this IConfiguration configuration, string key)
    {
        return configuration[key] ?? throw new Exception($"{key} is not defined in appsettings");
    }

    public static string RequireResolvedPath(this IConfiguration configuration, string key, IHostEnvironment env)
    {
        var value = configuration.RequireConfigValue(key);
        return Path.IsPathRooted(value)
             ? value
             : Path.GetFullPath(value, env.ContentRootPath);
    }
}
