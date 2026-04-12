using AutoMapper;
using FluentValidation;
using kaeltehilfe_backend.Models;
using NetTopologySuite.Geometries;

namespace kaeltehilfe_backend.Features.Comments;

public class CommentGeoLocationDto
{
    public double Lat { get; set; }
    public double Lng { get; set; }
}

public class CommentDto
{
    public int Id { get; set; }
    public string Text { get; set; } = "";
    public bool IsPinned { get; set; }
    public CommentGeoLocationDto? GeoLocation { get; set; }
    public string? LocationName { get; set; }
    public string DisplayName { get; set; } = "";
    public DateTime AddOn { get; set; }
}

public class CommentCreateDto
{
    public string Text { get; set; } = "";
    public CommentGeoLocationDto? GeoLocation { get; set; }
    public string? LocationName { get; set; }
    public string DisplayName { get; set; } = "";
    public bool IsPinned { get; set; }
}

public class CommentUpdateDto
{
    public string? Text { get; set; }
    public bool? IsPinned { get; set; }
}

public class CommentDtoProfile : Profile
{
    public CommentDtoProfile()
    {
        CreateMap<Comment, CommentDto>()
            .ForMember(d => d.AddOn, src => src.MapFrom(s => s.AddOn))
            .ForMember(
                d => d.GeoLocation,
                src =>
                    src.MapFrom(s =>
                        s.GeoLocation != null
                            ? new CommentGeoLocationDto
                            {
                                Lat = s.GeoLocation.Y,
                                Lng = s.GeoLocation.X,
                            }
                            : null
                    )
            );

        CreateMap<CommentCreateDto, Comment>()
            .ForMember(
                d => d.GeoLocation,
                opt =>
                    opt.MapFrom(s =>
                        s.GeoLocation != null
                            ? new Point(s.GeoLocation.Lng, s.GeoLocation.Lat) { SRID = 4326 }
                            : null
                    )
            );
    }
}

public class CommentCreateDtoValidator : AbstractValidator<CommentCreateDto>
{
    public CommentCreateDtoValidator()
    {
        RuleFor(c => c.Text).NotEmpty().MaximumLength(50000);
        RuleFor(c => c.DisplayName).NotEmpty();
    }
}

public class CommentUpdateDtoValidator : AbstractValidator<CommentUpdateDto>
{
    public CommentUpdateDtoValidator()
    {
        RuleFor(c => c.Text).MaximumLength(50000).When(c => c.Text != null);
    }
}
