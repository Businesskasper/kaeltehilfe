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
        await File.WriteAllBytesAsync(filePath, fileBytes);
    }

    public async Task<string?> ReadFile(string filePath)
    {
        if (!ExistsFileOrPath(filePath))
            return null;

        var fileBytes = await File.ReadAllBytesAsync(filePath);
        return Convert.ToBase64String(fileBytes);
    }

    public void DeleteFile(string filePath)
    {
        if (!ExistsFileOrPath(filePath))
            return;

        File.Delete(filePath);
    }

    public bool ExistsFileOrPath(string path)
    {
        return Path.Exists(path);
    }

    private void EnsureDir(string path)
    {
        var existsPath = ExistsFileOrPath(path);
        if (existsPath)
            return;

        Directory.CreateDirectory(path);
    }
}
