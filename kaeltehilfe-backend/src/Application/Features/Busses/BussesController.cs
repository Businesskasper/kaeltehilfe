using AutoMapper;
using FluentValidation;
using kaeltehilfe_backend.Infrastructure.Auth;
using kaeltehilfe_backend.Infrastructure.Database;
using kaeltehilfe_backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.EntityFrameworkCore;

namespace kaeltehilfe_backend.Features.Busses;

[Route("/api/[controller]")]
public class BussesController : ControllerBase
{
    protected readonly ILogger<BussesController> _logger;
    protected readonly KbContext _kbContext;
    protected readonly IMapper _mapper;
    protected readonly IUserService _userService;

    public BussesController(
        ILogger<BussesController> logger,
        KbContext kbContext,
        IMapper mapper,
        IUserService userService
    )
    {
        _logger = logger;
        _kbContext = kbContext;
        _mapper = mapper;
        _userService = userService;
    }

    [HttpGet()]
    [Authorize(Roles = "ADMIN,OPERATOR")]
    public async Task<IEnumerable<BusDto>> Query()
    {
        var tokenDetails = User.Claims.GetTokenDetails();

        var objs = await _kbContext.Busses.Where(x => !x.IsDeleted).ToListAsync();
        var dtos = _mapper.Map<List<BusDto>>(objs);

        return dtos;
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "ADMIN,OPERATOR")]
    public async Task<ActionResult<BusDto>> Get([FromRoute(Name = "id")] int id)
    {
        var obj = await _kbContext.Busses.FirstOrDefaultAsync(b => b.Id == id && !b.IsDeleted);
        return obj != null ? _mapper.Map<BusDto>(obj) : NotFound();
    }

    [HttpPost()]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> Create([FromBody()] BusCreateDto dto)
    {
        var existing = await _kbContext.Busses.FirstOrDefaultAsync(b =>
            b.RegistrationNumber == dto.RegistrationNumber && !b.IsDeleted
        );
        if (existing is not null)
            throw this.GetModelStateError(
                "registrationNumber",
                $"A bus with registration number {dto.RegistrationNumber} already exists"
            );

        var bus = _mapper.Map<Bus>(dto);
        var busResult = await _kbContext.Busses.AddAsync(bus);

        var existingLogin = await _userService.GetLogin(bus.RegistrationNumber);
        if (existingLogin is null)
        {
            var email = $"{bus.RegistrationNumber}@kaeltehilfe.de";
            var createdLogin = await _userService.CreateLogin(
                dto.RegistrationNumber.ToLower(),
                email,
                "Bus",
                dto.RegistrationNumber,
                Role.OPERATOR,
                dto.RegistrationNumber,
                null
            );
            var login = new OperatorLogin
            {
                RegistrationNumber = bus.RegistrationNumber,
                Username = bus.RegistrationNumber.ToLower(),
                Email = email,
                CreateOn = createdLogin.createdOn,
                IdentityProviderId = createdLogin.idpUsername,
            };
            await _kbContext.Logins.AddAsync(login);
        }

        await _kbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), routeValues: new { id = busResult.Entity.Id }, null);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<ActionResult> Put(
        [FromRoute(Name = "id")] int id,
        [FromBody(EmptyBodyBehavior = EmptyBodyBehavior.Allow)] BusCreateDto dto
    )
    {
        var existing = await _kbContext.Busses.FirstOrDefaultAsync(b => b.Id == id && !b.IsDeleted);
        if (existing is null)
            return NotFound();

        // var hdEntity = _mapper.Map(dto, existing);
        var updatedEntity = _mapper.Map<Bus>(dto);
        updatedEntity.Id = existing.Id;
        updatedEntity.AddOn = existing.AddOn;

        _kbContext.Entry(existing).CurrentValues.SetValues(updatedEntity);
        await _kbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<ActionResult> Delete([FromRoute(Name = "id")] int id)
    {
        var obj = await _kbContext.Busses.FirstOrDefaultAsync(b => b.Id == id && !b.IsDeleted);
        if (obj == null)
            return NotFound();

        obj.IsDeleted = true;
        await _kbContext.SaveChangesAsync();

        var authLogin = await _userService.GetLogin(obj.RegistrationNumber.ToLower());
        if (authLogin is not null)
        {
            await _userService.DeleteLogin(authLogin.IdentityProviderId);
            var dbLogin = await _kbContext.Logins.FirstOrDefaultAsync(l =>
                l.Username == obj.RegistrationNumber.ToLower()
            );
            if (dbLogin is not null)
                _kbContext.Logins.Remove(dbLogin);

            await _kbContext.SaveChangesAsync();
        }

        return NoContent();
    }
}
