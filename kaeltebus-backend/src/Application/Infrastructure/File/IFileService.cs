namespace kaeltebus_backend.Infrastructure.File;

public interface IFileService
{
    public Task SaveFile(string filePath, string encodedFile);
    public Task SaveFile(string filePath, byte[] fileBytes);
    public Task SaveText(string filePath, string text, System.Text.Encoding encoding);
    public Task<string?> ReadFile(string filePath);
    public Task<string?> ReadText(string filePath, System.Text.Encoding encoding);
    public Task<byte[]?> ReadFileAsBytes(string filePath);
    public void DeleteFile(string filePath);
    public bool ExistsFileOrPath(string path);
}
