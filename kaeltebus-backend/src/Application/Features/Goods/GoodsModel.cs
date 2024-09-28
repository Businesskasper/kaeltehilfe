using AutoMapper;
using FluentValidation;
using kaeltebus_backend.Infrastructure.Database;
using kaeltebus_backend.Models;
using Microsoft.AspNetCore.Mvc;

namespace kaeltebus_backend.Features.Goods;

public class GoodDto
{
    public int Id { get; set; }
    public string? Name { get; set; }
    public string? Description { get; set; }
    public GoodType? GoodType { get; set; }
    public List<string>? Tags { get; set; }
    public int? TwoWeekThreshold { get; set; }
}

public class GoodCreateDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public GoodType? GoodType { get; set; }
    public List<string>? Tags { get; set; }
    public int? TwoWeekThreshold { get; set; }
}

public class GoodDtoToObjProfile : Profile
{
    public GoodDtoToObjProfile()
    {
        CreateMap<GoodCreateDto, Good>();
        CreateMap<Good, GoodCreateDto>();

        CreateMap<Good, GoodDto>();
    }
}

public class GoodCreateDtoValidator : AbstractValidator<GoodCreateDto>
{
    public GoodCreateDtoValidator()
    {
        RuleFor(g => g.Name).NotNull().MinimumLength(3);
        RuleFor(g => g.GoodType).NotNull().IsInEnum();
        RuleFor(g => g.TwoWeekThreshold).GreaterThan(0).When(g => g.TwoWeekThreshold.HasValue);
    }
}
