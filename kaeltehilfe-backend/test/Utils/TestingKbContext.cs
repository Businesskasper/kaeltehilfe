using kaeltehilfe_backend.Infrastructure.Database;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;

public class TestingKbContext : KbContext
{
    private bool _disposed;
    private static DbContextOptions<KbContext> _defaultOptions =
        new DbContextOptionsBuilder<KbContext>()
            .UseSqlite("DataSource=file::memory:?cache=shared")
            .Options;

    public TestingKbContext()
        : base(_defaultOptions, new TestHostingEnvironment("Production"))
    {
        Database.OpenConnection();
        Database.EnsureCreated();
    }

    public override void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (!_disposed)
        {
            if (disposing)
            {
                Database.CloseConnection();
                base.Dispose();
            }
        }

        _disposed = true;
    }
}

internal class TestHostingEnvironment : IWebHostEnvironment
{
    public string WebRootPath
    {
        get => throw new NotImplementedException();
        set => throw new NotImplementedException();
    }
    public IFileProvider WebRootFileProvider
    {
        get => throw new NotImplementedException();
        set => throw new NotImplementedException();
    }
    public string ApplicationName
    {
        get => throw new NotImplementedException();
        set => throw new NotImplementedException();
    }
    public IFileProvider ContentRootFileProvider
    {
        get => throw new NotImplementedException();
        set => throw new NotImplementedException();
    }
    public string ContentRootPath
    {
        get => throw new NotImplementedException();
        set => throw new NotImplementedException();
    }

    private string _environmentName;
    string IHostEnvironment.EnvironmentName
    {
        get => _environmentName;
        set => throw new NotImplementedException();
    }

    public TestHostingEnvironment(string environmentName)
    {
        _environmentName = environmentName;
    }
}
