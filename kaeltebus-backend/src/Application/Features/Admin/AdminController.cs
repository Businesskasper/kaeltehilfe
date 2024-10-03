using kaeltebus_backend.Infrastructure.Database;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace kaeltebus_backend.Features.Admin;

[Route("/api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    protected readonly ILogger<AdminController> _logger;
    protected readonly ISeeder<KbContext> _kbSeeder;

    public AdminController(ILogger<AdminController> logger, ISeeder<KbContext> kbSeeder)
    {
        _logger = logger;
        _kbSeeder = kbSeeder;
    }

    [HttpPost("/Seed")]
    [Authorize(Roles = "Admin")]
    public IActionResult Seed()
    {
        _logger.LogInformation("Received seeding request");

        _kbSeeder.SeedData();

        return Ok();
    }
}
