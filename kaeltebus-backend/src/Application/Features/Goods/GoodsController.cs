using AutoMapper;
using FluentValidation;
using kaeltebus_backend.Infrastructure.Database;
using kaeltebus_backend.Models;
using Microsoft.AspNetCore.Mvc;

namespace kaeltebus_backend.Features.Goods;

[Route("/api/[controller]")]
public class GoodsController : CRUDQController<Good, GoodCreateDto, GoodUpdateDto, GoodListDto>
{
    public GoodsController(
        ILogger<CRUDQController<Good, GoodCreateDto, GoodUpdateDto, GoodListDto>> logger,
        KbContext kbContext,
        IMapper mapper,
        IValidator<GoodCreateDto> validator
    )
        : base(logger, kbContext, mapper, validator) { }
}

public class GoodCreateDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public GoodType? GoodType { get; set; }
    public List<string>? Tags { get; set; }
    public int? TwoWeekThreshold { get; set; }
}

public class GoodUpdateDto : GoodCreateDto;

public class GoodListDto : GoodCreateDto
{
    public int Id { get; set; }
}

public class GoodDtoToObjProfile : Profile
{
    public GoodDtoToObjProfile()
    {
        CreateMap<GoodCreateDto, Good>();
        CreateMap<Good, GoodCreateDto>();

        CreateMap<Good, GoodListDto>();

        CreateMap<GoodUpdateDto, Good>();
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

public class GoodUpdateDtoValidator : AbstractValidator<GoodUpdateDto>
{
    public GoodUpdateDtoValidator()
    {
        RuleFor(g => g.Name).MinimumLength(3).When(g => g.Name is not null);
        RuleFor(g => g.GoodType).IsInEnum().When(g => g.GoodType is not null);
        RuleFor(g => g.TwoWeekThreshold).GreaterThan(0).When(g => g.TwoWeekThreshold.HasValue);
    }
}
