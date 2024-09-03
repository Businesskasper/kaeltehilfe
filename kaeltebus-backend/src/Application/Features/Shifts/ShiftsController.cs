using System.Text.Json;
using AutoMapper;
using FluentValidation;
using kaeltebus_backend.Infrastructure.Database;
using kaeltebus_backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.EntityFrameworkCore;

[Route("/api/[controller]")]
public class ShiftsController : ControllerBase
{
    private readonly ILogger<ShiftsController> _logger;
    private readonly KbContext _kbContext;
    private readonly IMapper _mapper;
    private readonly IValidator<ShiftCreateDto> _validator;

    public ShiftsController(
        ILogger<ShiftsController> logger,
        KbContext kbContext,
        IMapper mapper,
        IValidator<ShiftCreateDto> validator
    )
    {
        _logger = logger;
        _kbContext = kbContext;
        _mapper = mapper;
        _validator = validator;
    }

    [HttpGet()]
    public async Task<IEnumerable<ShiftListDto>> Query()
    {
        var objs = await _kbContext.Shifts.Where(x => !x.IsDeleted).ToListAsync();
        var dtos = _mapper.Map<List<ShiftListDto>>(objs);

        return dtos;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ShiftListDto>> Get([FromRoute(Name = "id")] int id)
    {
        var obj = await _kbContext.Shifts.FirstOrDefaultAsync(x => x.Id == id);
        return obj != null ? _mapper.Map<ShiftListDto>(obj) : NotFound();
    }

    [HttpPost()]
    public async Task<IActionResult> Create([FromBody()] ShiftCreateDto dto)
    {
        var obj = _mapper.Map<Shift>(dto);
        var volunteers = await _kbContext.Volunteers.Where(x => !x.IsDeleted && dto.Volunteers.Select(x => x.Id).Contains(x.Id)).ToDictionaryAsync(x => x.Id);
        List<Volunteer> newVolunteers = [];
        foreach (var submittedVolunteer in obj.Volunteers)
        {
            var volunteerEntry = volunteers[submittedVolunteer.Id];
            if (volunteerEntry == null)
            {
                var modelState = new ModelStateDictionary();
                modelState.AddModelError("Volunteers", $"Volunteer ${submittedVolunteer.Id} was not found");
                throw new InvalidModelStateException(modelState);
            }

            newVolunteers.Add(volunteerEntry);
        }
        obj.Volunteers = newVolunteers;


        _logger.LogInformation($"Found {newVolunteers.Count} volunteers");
        _logger.LogInformation($"First volunteer {newVolunteers[0].Fullname}");


        var result = _kbContext.Shifts.Attach(obj);
        await _kbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), routeValues: new { id = result.Entity.Id }, null);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Put([FromRoute(Name = "id")] int id, [FromBody(EmptyBodyBehavior = EmptyBodyBehavior.Allow)] ShiftCreateDto dto)
    {
        var existing = await _kbContext.Shifts.FindAsync(id);
        if (existing is null) return NotFound();

        var updatedObj = _mapper.Map<Shift>(dto);

        existing.Date = updatedObj.Date;
        existing.IsDeleted = updatedObj.IsDeleted;
        existing.Volunteers.Clear();

        var volunteers = await _kbContext.Volunteers.Where(x => !x.IsDeleted && updatedObj.Volunteers.Select(y => y.Id).Contains(x.Id)).ToListAsync();
        var reorderedVolunteers = updatedObj.Volunteers.SelectMany(x => volunteers.Where(y => y.Id == x.Id)).ToList();
        foreach (var reorderedVolunteer in reorderedVolunteers)
            existing.Volunteers.Add(reorderedVolunteer);
        _logger.LogInformation($"First {reorderedVolunteers[0].Fullname}");

        _kbContext.Shifts.Update(existing);
        await _kbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete([FromRoute(Name = "id")] int id)
    {
        var obj = await _kbContext.Shifts.FindAsync(id);
        if (obj == null) return NotFound();

        obj.IsDeleted = true;
        await _kbContext.SaveChangesAsync();

        return NoContent();
    }
}

public class ShiftCreateDto
{
    public DateOnly? Date { get; set; }
    public List<ShiftCreateVolunteerDto> Volunteers { get; set; } = [];
}

public class ShiftCreateVolunteerDto
{
    public int Id { get; set; }
}

public class ShiftUpdateDto : ShiftCreateDto;
public class ShiftListDto
{
    public int Id { get; set; }
    public DateOnly? Date { get; set; }
    public List<ShiftListVolunteerDto>? Volunteers { get; set; }
}
public class ShiftListVolunteerDto
{
    public int Id { get; set; }
    public string Fullname { get; set; } = "";
    public Gender Gender { get; set; }
    public bool IsDriver { get; set; }
}


public class ShiftDtoToObjProfile : Profile
{
    public ShiftDtoToObjProfile()
    {
        CreateMap<ShiftCreateDto, Shift>();
        CreateMap<ShiftCreateVolunteerDto, Volunteer>();

        CreateMap<Shift, ShiftCreateDto>();
        CreateMap<Volunteer, ShiftCreateVolunteerDto>();

        CreateMap<Volunteer, ShiftListVolunteerDto>();
        CreateMap<Shift, ShiftListDto>().ForMember(shift => shift.Volunteers, opt => opt.MapFrom(src => src.Volunteers));

        CreateMap<ShiftUpdateDto, Shift>();
    }
}

public class ShiftCreateDtoValidator : AbstractValidator<ShiftCreateDto>
{
    public ShiftCreateDtoValidator()
    {
        RuleFor(shift => shift.Date).NotNull();
        RuleFor(shift => shift.Volunteers).NotNull();
        RuleForEach(shift => shift.Volunteers).SetValidator(new ShiftVolunteerDtoValidator());
        RuleFor(shift => shift.Volunteers).Must(volunteers => !HasDuplicates(volunteers)).WithMessage("Volunteers can only be assigned once to a single shift");
    }

    private bool HasDuplicates(List<ShiftCreateVolunteerDto> volunteers)
    {
        return volunteers.GroupBy(volunteer => volunteer.Id).Any(group => group.Count() > 1);
    }
}

public class ShiftUpdateDtoValidator : AbstractValidator<ShiftUpdateDto>
{
    public ShiftUpdateDtoValidator()
    {
        RuleForEach(x => x.Volunteers).SetValidator(new ShiftVolunteerDtoValidator());
    }
}

public class ShiftVolunteerDtoValidator : AbstractValidator<ShiftCreateVolunteerDto>
{
    public ShiftVolunteerDtoValidator()
    {
        RuleFor(shift => shift.Id).NotNull();
    }
}