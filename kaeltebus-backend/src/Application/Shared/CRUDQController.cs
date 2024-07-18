using System.Text.Json;
using AutoMapper;
using FluentValidation;
using kaeltebus_backend.Infrastructure.Database;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.EntityFrameworkCore;

public abstract class CRUDQController<TEntity, TCreateDto, TUpdateDto, TListDto> : ControllerBase where TEntity : BaseEntity
{
    private readonly ILogger<CRUDQController<TEntity, TCreateDto, TUpdateDto, TListDto>> _logger;
    private readonly KbContext _kbContext;
    private readonly IMapper _mapper;
    private readonly IValidator<TCreateDto> _validator;

    public CRUDQController(
        ILogger<CRUDQController<TEntity, TCreateDto, TUpdateDto, TListDto>> logger,
        KbContext kbContext,
        IMapper mapper,
        IValidator<TCreateDto> validator
    )
    {
        _logger = logger;
        _kbContext = kbContext;
        _mapper = mapper;
        _validator = validator;
    }

    [HttpGet()]
    public async Task<IEnumerable<TListDto>> Query()
    {
        var objs = await _kbContext.Set<TEntity>().Where(x => !x.IsDeleted).ToListAsync();
        var dtos = _mapper.Map<List<TEntity>, List<TListDto>>(objs);

        return dtos;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TCreateDto>> Get([FromRoute(Name = "id")] int id)
    {
        var obj = await _kbContext.Set<TEntity>().FirstOrDefaultAsync(x => x.Id == id);
        return obj != null ? _mapper.Map<TCreateDto>(obj) : NotFound();
    }

    [HttpPost()]
    public async Task<IActionResult> Create([FromBody()] TCreateDto dto)
    {
        var obj = _mapper.Map<TEntity>(dto);
        var result = await _kbContext.Set<TEntity>().AddAsync(obj);
        await _kbContext.SaveChangesAsync();

        // // return CreatedAtAction(nameof(Get), new { id = result.Entity.Id });
        return CreatedAtAction(nameof(Get), routeValues: new { id = result.Entity.Id }, null);
    }

    [HttpPatch("{id}")]
    public async Task<ActionResult> Update([FromRoute(Name = "id")] int id, [FromBody(EmptyBodyBehavior = EmptyBodyBehavior.Allow)] TUpdateDto update)
    {
        if (update is null) throw new InvalidModelStateException(new ModelStateDictionary());

        var existing = await _kbContext.Set<TEntity>().FindAsync(id);
        if (existing is null) return NotFound();

        // Generate full updated object by merging existing and updated as DTO and mapping back to domain model
        var existingDto = _mapper.Map<TEntity, TCreateDto>(existing);
        var updated = getUpdated(existingDto, update);
        var updatedObj = _mapper.Map<TEntity>(updated);
        updatedObj.Id = existing.Id;
        updatedObj.AddOn = existing.AddOn;

        _kbContext.Entry(existing).CurrentValues.SetValues(updatedObj);
        await _kbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Put([FromRoute(Name = "id")] int id, [FromBody(EmptyBodyBehavior = EmptyBodyBehavior.Allow)] TCreateDto dto)
    {
        var existing = await _kbContext.Set<TEntity>().FindAsync(id);
        if (existing is null) return NotFound();

        var obj = _mapper.Map<TEntity>(dto);
        _kbContext.Set<TEntity>().Entry(obj).State = EntityState.Modified;
        await _kbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete([FromRoute(Name = "id")] int id)
    {
        var obj = await _kbContext.Set<TEntity>().FindAsync(id);
        if (obj == null) return NotFound();

        // _kbContext.Set<TEntity>().Remove(obj);
        obj.IsDeleted = true;
        await _kbContext.SaveChangesAsync();

        return NoContent();
    }

    private TCreateDto getUpdated(TCreateDto existing, TUpdateDto update)
    {
        var updated = Activator.CreateInstance<TCreateDto>();
        var properties = existing?.GetType().GetProperties();
        foreach (var property in properties ?? [])
        {
            property.SetValue(updated, property.GetValue(update) ?? property.GetValue(existing));
        }

        return updated;
    }
}

public static class ControllerExtensions
{
    public static async Task<Dictionary<string, object?>> GetUpdatedFields<TData>(this Stream body)
    {
        var result = new Dictionary<string, object?>(); ;

        body.Position = 0;
        var json = await JsonSerializer.DeserializeAsync<Dictionary<string, object>>(body);
        if (json is null) return result;

        var properties = typeof(TData).GetProperties();

        foreach (var property in properties)
        {
            var jsonKey = $"{property.Name[0].ToString().ToLower()}{property.Name[1..property.Name.Length]}";
            if (!json.ContainsKey(jsonKey)) continue;

            // var value = ParseValue((JsonElement)json[jsonKey]);
            var value = json[jsonKey].ToString();
            result.Add(property.Name, value);
        }

        return result;
    }
}