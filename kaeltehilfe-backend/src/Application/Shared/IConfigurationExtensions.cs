using System;
using System.IO;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

public static class ConfigurationExtensions
{
    public static string RequireConfigValue(this IConfiguration configuration, string key)
    {
        var value = configuration[key];
        return !string.IsNullOrWhiteSpace(value)
            ? value
            : throw new Exception($"{key} is not defined in appsettings or environment variables");
    }

    public static string RequireResolvedPath(this IConfiguration configuration, string key, IHostEnvironment env)
    {
        var value = configuration.RequireConfigValue(key);
        return Path.IsPathRooted(value)
             ? value
             : Path.GetFullPath(value, env.ContentRootPath);
    }
}
