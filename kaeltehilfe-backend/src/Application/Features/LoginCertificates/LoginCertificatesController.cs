using System.Text;
using AutoMapper;
using kaeltehilfe_backend.Infrastructure.Auth;
using kaeltehilfe_backend.Infrastructure.Database;
using kaeltehilfe_backend.Infrastructure.File;
using kaeltehilfe_backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace kaeltehilfe_backend.Features.LoginCertificates;

[Route("/api/[controller]")]
public class LoginCertificatesController : ControllerBase
{
    protected readonly ILogger<LoginCertificatesController> _logger;
    protected readonly KbContext _kbContext;
    protected readonly IMapper _mapper;
    protected readonly ICertService _certService;
    protected readonly IFileService _fileService;
    protected readonly string _certFileDir;
    protected readonly string _crlPath;

    public LoginCertificatesController(
        IConfiguration configuration,
        ILogger<LoginCertificatesController> logger,
        KbContext kbContext,
        IMapper mapper,
        ICertService certService,
        IFileService fileService
    )
    {
        _logger = logger;
        _kbContext = kbContext;
        _mapper = mapper;
        _certService = certService;
        _fileService = fileService;

        _certFileDir = configuration.RequireConfigValue("CertificateSettings:ClientCertDir");
        _crlPath = configuration.RequireConfigValue("CertificateSettings:CrlPath");
    }

    [HttpPost()]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> CreateCert(
        [FromBody] CreateLoginCertificateRequest createCertRequest
    )
    {
        _logger.LogInformation($"Generate certificate for {createCertRequest.LoginUsername}");

        await using var transaction = await _kbContext.Database.BeginTransactionAsync();
        try
        {
            var login = await _kbContext.Logins.FindAsync(createCertRequest.LoginUsername);
            if (login == null)
                return NotFound();

            // Create the certificate
            var certResult = await _certService.GenerateClientCert(
                login.Username,
                createCertRequest.PfxPassword
            );

            var certFileName = $"{login.Username}_{certResult.Thumbprint}.pfx";
            var certFilePath = Path.Combine(_certFileDir, certFileName);

            // Save the certificate
            await _fileService.SaveFile(certFilePath, certResult.EncodedCertChain);

            var loginCert = new LoginCertificate
            {
                Thumbprint = certResult.EncodedCertChain,
                Description = createCertRequest.Description,
                ValidFrom = certResult.ValidFrom,
                ValidTo = certResult.ValidTo,
                FileName = certFileName,
                SerialNumber = certResult.SerialNumber,
                // Must be manually tracked since the foreign key is not cascade deleted
                LoginUsername = login.Username,
                Login = login,
                Status = CertificateStatus.ACTIVE,
            };
            await _kbContext.LoginCertificates.AddAsync(loginCert);
            await _kbContext.SaveChangesAsync();

            await transaction.CommitAsync();

            return Ok(new { loginCert.FileName, certResult.EncodedCertChain });
        }
        catch (Exception ex)
        {
            // Rollback the transaction if any error occurs
            _logger.LogError(ex, "Error generating certificate");
            await transaction.RollbackAsync();

            // Attempt to delete the file if it was created before the exception
            var certFileName = $"{createCertRequest.LoginUsername}.pfx";
            var certFilePath = Path.Combine(_certFileDir, certFileName);
            if (_fileService.ExistsFileOrPath(certFilePath))
            {
                _fileService.DeleteFile(certFilePath);
                _logger.LogInformation($"Deleted orphaned certificate file: {certFilePath}");
            }

            return StatusCode(500, "An error occurred while creating the certificate.");
        }
    }

    [HttpGet()]
    [Authorize(Roles = "ADMIN")]
    public async Task<ActionResult<List<LoginCertificateDto>>> Query()
    {
        var objs = await _kbContext.LoginCertificates.Where(lc => !lc.IsDeleted).ToListAsync();
        var dtos = _mapper.Map<List<LoginCertificateDto>>(objs);

        return dtos;
    }

    [HttpGet("{id}/content")]
    [Authorize(Roles = "ADMIN")]
    public async Task<ActionResult<LoginCertificateContentDto>> GetCertContent(
        [FromRoute(Name = "id")] int id
    )
    {
        var cert = await _kbContext.LoginCertificates.FirstOrDefaultAsync(lc =>
            lc.Id == id && !lc.IsDeleted
        );
        if (cert is null)
            return NotFound();

        var filePath = Path.Combine(_certFileDir, cert.FileName);
        var content = await _fileService.ReadFile(filePath);
        if (string.IsNullOrWhiteSpace(content))
            return NotFound();

        return new LoginCertificateContentDto
        {
            FileName = cert.FileName,
            EncodedCertChain = content,
        };
    }

    [HttpPost("{id}/revocation")]
    [Authorize(Roles = "ADMIN")]
    public async Task<ActionResult> RevokeCert([FromRoute(Name = "id")] int id)
    {
        var cert = await _kbContext.LoginCertificates.FirstOrDefaultAsync(lc =>
            lc.Id == id && !lc.IsDeleted
        );
        if (cert is null)
            return NotFound();

        var revocationList =
            await _fileService.ReadText(_crlPath, Encoding.ASCII)
            ?? _certService.CrlToPem(_certService.GenerateCrl());

        var updatedRevocationList = _certService.AddCertToCrl(revocationList, cert.SerialNumber);
        if (updatedRevocationList is null)
            return Problem("Could not revoke certificate");

        var crlAsPem = _certService.CrlToPem(updatedRevocationList);
        await _fileService.SaveText(_crlPath, crlAsPem, Encoding.ASCII);

        cert.Status = CertificateStatus.REVOKED;
        await _kbContext.SaveChangesAsync();

        return NoContent();
    }
}
