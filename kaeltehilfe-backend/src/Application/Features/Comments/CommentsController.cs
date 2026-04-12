using AutoMapper;
using kaeltehilfe_backend.Features.Comments;
using kaeltehilfe_backend.Infrastructure.Database;
using kaeltehilfe_backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace kaeltehilfe_backend.Features.Comments;

[Route("/api/[controller]")]
public class CommentsController : ControllerBase
{
    private readonly ILogger<CommentsController> _logger;
    private readonly KbContext _kbContext;
    private readonly IMapper _mapper;

    public CommentsController(
        ILogger<CommentsController> logger,
        KbContext kbContext,
        IMapper mapper
    )
    {
        _logger = logger;
        _kbContext = kbContext;
        _mapper = mapper;
    }

    [HttpGet()]
    [Authorize(Roles = "ADMIN,OPERATOR")]
    public async Task<ActionResult<IEnumerable<CommentDto>>> Query(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to
    )
    {
        _logger.LogInformation("Querying comments");
        var query = _kbContext.Comments.AsQueryable().Where(x => !x.IsDeleted);
        if (from.HasValue)
        {
            _logger.LogInformation("...from {From}", from);
            query = query.Where(x => x.AddOn >= from);
        }
        if (to.HasValue)
        {
            _logger.LogInformation("...to {To}", to);
            query = query.Where(x => x.AddOn <= to);
        }

        var objs = await query
            .OrderByDescending(x => x.IsPinned)
            .ThenByDescending(x => x.AddOn)
            .ToListAsync();

        return _mapper.Map<List<CommentDto>>(objs ?? []);
    }

    [HttpPost()]
    [Authorize(Roles = "ADMIN,OPERATOR")]
    public async Task<IActionResult> Create([FromBody] CommentCreateDto dto)
    {
        var comment = _mapper.Map<Comment>(dto);
        await _kbContext.Comments.AddAsync(comment);
        await _kbContext.SaveChangesAsync();

        return Ok();
    }

    [HttpPatch("{id}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> Update(
        [FromRoute(Name = "id")] int id,
        [FromBody] CommentUpdateDto dto
    )
    {
        var comment = await _kbContext.Comments.FirstOrDefaultAsync(c =>
            c.Id == id && !c.IsDeleted
        );
        if (comment is null)
            return NotFound();

        if (dto.Text != null)
            comment.Text = dto.Text;
        if (dto.IsPinned.HasValue)
            comment.IsPinned = dto.IsPinned.Value;

        await _kbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> Delete([FromRoute(Name = "id")] int id)
    {
        var comment = await _kbContext.Comments.FirstOrDefaultAsync(c =>
            c.Id == id && !c.IsDeleted
        );
        if (comment is null)
            return NotFound();

        comment.IsDeleted = true;
        await _kbContext.SaveChangesAsync();

        return NoContent();
    }
}
