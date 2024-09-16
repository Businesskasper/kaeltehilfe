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
        RuleFor(x => x.Name).NotNull().MinimumLength(3);
        RuleFor(x => x.GoodType).NotNull().IsInEnum();
    }
}

public class GoodUpdateDtoValidator : AbstractValidator<GoodUpdateDto>
{
    public GoodUpdateDtoValidator()
    {
        RuleFor(x => x.Name).MinimumLength(3).When(x => x.Name is not null);
        RuleFor(x => x.GoodType).IsInEnum().When(x => x.GoodType is not null);
    }
}
