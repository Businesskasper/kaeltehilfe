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
    public async Task<IEnumerable<ShiftQueryDto>> Query()
    {
        var objs = await _kbContext
            .Shifts.Where(x => !x.IsDeleted)
            .Include(s => s.ShiftVolunteers)
            .ThenInclude(sv => sv.Volunteer)
            .ToListAsync();
        var dtos = _mapper.Map<List<ShiftQueryDto>>(objs);

        return dtos;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ShiftQueryDto>> Get([FromRoute(Name = "id")] int id)
    {
        var obj = await _kbContext.Shifts.FirstOrDefaultAsync(x => x.Id == id);
        return obj != null ? _mapper.Map<ShiftQueryDto>(obj) : NotFound();
    }

    [HttpPost()]
    public async Task<IActionResult> Create([FromBody()] ShiftCreateDto dto)
    {
        var obj = _mapper.Map<Shift>(dto);
        var volunteers = await _kbContext
            .Volunteers.Where(x => !x.IsDeleted && dto.Volunteers.Select(x => x.Id).Contains(x.Id))
            .ToDictionaryAsync(x => x.Id);
        obj.ShiftVolunteers = dto.Volunteers.ToShiftVolunteers(volunteers);

        var result = await _kbContext.Shifts.AddAsync(obj);
        await _kbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), routeValues: new { id = result.Entity.Id }, null);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Put(
        [FromRoute(Name = "id")] int id,
        [FromBody(EmptyBodyBehavior = EmptyBodyBehavior.Allow)] ShiftCreateDto dto
    )
    {
        var existing = await _kbContext
            .Shifts.Include(s => s.ShiftVolunteers)
            .ThenInclude(sv => sv.Volunteer)
            .FirstOrDefaultAsync(s => s.Id == id);
        if (existing is null)
            return NotFound();

        var updatedObj = _mapper.Map<Shift>(dto);
        existing.Date = updatedObj.Date;
        existing.IsDeleted = updatedObj.IsDeleted;
        existing.ShiftVolunteers.Clear();

        var volunteers = await _kbContext
            .Volunteers.Where(x => !x.IsDeleted && dto.Volunteers.Select(x => x.Id).Contains(x.Id))
            .ToDictionaryAsync(x => x.Id);
        existing.ShiftVolunteers = dto.Volunteers.ToShiftVolunteers(volunteers);

        _kbContext.Shifts.Update(existing);
        await _kbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete([FromRoute(Name = "id")] int id)
    {
        var obj = await _kbContext.Shifts.FindAsync(id);
        if (obj == null)
            return NotFound();

        obj.IsDeleted = true;
        await _kbContext.SaveChangesAsync();

        return NoContent();
    }
}

static class ShiftsExtensions
{
    public static List<ShiftVolunteer> ToShiftVolunteers(
        this List<ShiftCreateVolunteerDto> submittedVolunteers,
        Dictionary<int, Volunteer> resolvedVolunteers
    )
    {
        return submittedVolunteers
            .Select(
                (submittedVolunteer, index) =>
                {
                    var volunteerEntry = resolvedVolunteers[submittedVolunteer.Id];
                    if (volunteerEntry == null)
                    {
                        var modelState = new ModelStateDictionary();
                        modelState.AddModelError(
                            "Volunteers",
                            $"Volunteer ${submittedVolunteer.Id} was not found"
                        );
                        throw new InvalidModelStateException(modelState);
                    }
                    return new ShiftVolunteer { Order = index, Volunteer = volunteerEntry };
                }
            )
            .ToList();
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

public class ShiftQueryDto
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
        // CreateMap<ShiftCreateVolunteerDto, Volunteer>();

        // CreateMap<Shift, ShiftCreateDto>();
        // CreateMap<Volunteer, ShiftCreateVolunteerDto>();

        // CreateMap<Volunteer, ShiftListVolunteerDto>();
        // CreateMap<Shift, ShiftQueryDto>().ForMember(shift => shift.Volunteers, opt => opt.MapFrom(src => src.Volunteers));

        // CreateMap<ShiftUpdateDto, Shift>();


        CreateMap<Shift, ShiftQueryDto>()
            .ForMember(
                dest => dest.Volunteers,
                opt =>
                    opt.MapFrom(src =>
                        src.ShiftVolunteers.OrderBy(sv => sv.Order)
                            .Select(sv => new ShiftListVolunteerDto
                            {
                                Id = sv.Volunteer.Id,
                                Fullname = sv.Volunteer.Fullname,
                                Gender = sv.Volunteer.Gender,
                                IsDriver = sv.Volunteer.IsDriver,
                            })
                            .ToList()
                    )
            )
            .ForMember(dest => dest.Date, opt => opt.MapFrom(src => src.Date))
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id));
    }
}

public class ShiftCreateDtoValidator : AbstractValidator<ShiftCreateDto>
{
    public ShiftCreateDtoValidator()
    {
        RuleFor(shift => shift.Date).NotNull();
        RuleFor(shift => shift.Volunteers).NotNull();
        RuleForEach(shift => shift.Volunteers).SetValidator(new ShiftVolunteerDtoValidator());
        RuleFor(shift => shift.Volunteers)
            .Must(volunteers => !HasDuplicates(volunteers))
            .WithMessage("Volunteers can only be assigned once to a single shift");
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
