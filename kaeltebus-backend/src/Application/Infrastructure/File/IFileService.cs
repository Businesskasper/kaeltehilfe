public interface IFileService
{
    public Task SaveFile(string filePath, string encodedFile);
    public Task<string?> ReadFile(string filePath);
    public void DeleteFile(string filePath);
    public bool ExistsFileOrPath(string path);
}
