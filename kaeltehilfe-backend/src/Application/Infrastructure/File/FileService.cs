using System.Text;

namespace kaeltehilfe_backend.Infrastructure.File;

public class FileService : IFileService
{
    public FileService() { }

    public async Task SaveFile(string filePath, string encodedFile)
    {
        var fileDir =
            Path.GetDirectoryName(filePath)
            ?? throw new Exception($"Path could not be resolved for {filePath}");
        EnsureDir(fileDir);

        var fileBytes = Convert.FromBase64String(encodedFile);
        await System.IO.File.WriteAllBytesAsync(filePath, fileBytes);
    }

    public async Task SaveFile(string filePath, byte[] fileBytes)
    {
        var fileDir =
            Path.GetDirectoryName(filePath)
            ?? throw new Exception($"Path could not be resolved for {filePath}");
        EnsureDir(fileDir);

        await System.IO.File.WriteAllBytesAsync(filePath, fileBytes);
    }

    public async Task SaveText(string filePath, string text, Encoding encoding)
    {
        using var streamWriter = new StreamWriter(filePath, false, encoding);
        await streamWriter.WriteAsync(text);
    }

    public async Task<string?> ReadFile(string filePath)
    {
        if (!ExistsFileOrPath(filePath))
            return null;

        var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
        return Convert.ToBase64String(fileBytes);
    }

    public async Task<byte[]?> ReadFileAsBytes(string filePath)
    {
        if (!ExistsFileOrPath(filePath))
            return null;

        var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
        return fileBytes;
    }

    public async Task<string?> ReadText(string filePath, Encoding encoding)
    {
        if (!ExistsFileOrPath(filePath))
            return null;

        var fileContent = await System.IO.File.ReadAllTextAsync(filePath, encoding);
        return fileContent;
    }

    public void DeleteFile(string filePath)
    {
        if (!ExistsFileOrPath(filePath))
            return;

        System.IO.File.Delete(filePath);
    }

    public bool ExistsFileOrPath(string path)
    {
        return System.IO.Path.Exists(path);
    }

    private void EnsureDir(string path)
    {
        var existsPath = ExistsFileOrPath(path);
        if (existsPath)
            return;

        System.IO.Directory.CreateDirectory(path);
    }
}
