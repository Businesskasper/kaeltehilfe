using AutoMapper;
using kaeltebus_backend.Infrastructure.Auth;
using kaeltebus_backend.Infrastructure.Database;
using kaeltebus_backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace kaeltebus_backend.Features.LoginCertificates;

[Route("/api/[controller]")]
public class LoginCertificatesController : ControllerBase
{
    protected readonly ILogger<LoginCertificatesController> _logger;
    protected readonly KbContext _kbContext;
    protected readonly IMapper _mapper;
    protected readonly ICertService _certService;
    protected readonly IFileService _fileService;
    protected readonly string _certFileDir;

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

            var certFileName = $"{certResult.Thumbprint}.pfx";
            var certFilePath = Path.Combine(_certFileDir, certFileName);

            // Save the certificate
            await _fileService.SaveFile(certFilePath, certResult.EncodedCertChain);

            var loginCert = new LoginCertificate
            {
                Thumbprint = certResult.EncodedCertChain,
                ValidFrom = certResult.ValidFrom,
                ValidTo = certResult.ValidTo,
                FileName = certFileName,
                // Must be manually tracked since the foreign key is not cascade deleted
                LoginUsername = login.Username,
                Login = login,
            };
            await _kbContext.LoginCertificates.AddAsync(loginCert);
            await _kbContext.SaveChangesAsync();

            await transaction.CommitAsync();

            return Ok(new { certResult.EncodedCertChain });
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
        var objs = await _kbContext.LoginCertificates.ToListAsync();
        var dtos = _mapper.Map<List<LoginCertificateDto>>(objs);

        return dtos;
    }

    [HttpGet("{thumbprint}/content")]
    [Authorize(Roles = "ADMIN")]
    public async Task<ActionResult<LoginCertificateContentDto>> GetCertContent(
        [FromRoute(Name = "thumbprint")] string thumbprint
    )
    {
        var cert = await _kbContext.LoginCertificates.FirstOrDefaultAsync(lc =>
            lc.Thumbprint == thumbprint
        );
        if (cert is null)
            return NotFound();

        var filePath = Path.Combine(_certFileDir, cert.FileName);
        var content = await _fileService.ReadFile(filePath);
        if (string.IsNullOrWhiteSpace(content))
            return NotFound();

        return new LoginCertificateContentDto { EncodedContent = content };
    }
}
