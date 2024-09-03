using AutoMapper;
using FluentValidation;
using kaeltebus_backend.Infrastructure.Database;
using kaeltebus_backend.Models;
using Microsoft.AspNetCore.Mvc;

namespace kaeltebus_backend.Features.Clients;

[Route("/api/[controller]")]
public class ClientsController : CRUDQController<Client, ClientCreateDto, ClientUpdateDto, ClientListDto>
{
    public ClientsController(
        ILogger<CRUDQController<Client, ClientCreateDto, ClientUpdateDto, ClientListDto>> logger,
        KbContext kbContext,
        IMapper mapper,
        IValidator<ClientCreateDto> validator
    ) : base(logger, kbContext, mapper, validator) { }
}
public class ClientCreateDto
{
    public string? Name { get; set; }
    public Gender? Gender { get; set; }
    public int? ApproxAge { get; set; }
    public string? Remarks { get; set; }
}

public class ClientUpdateDto : ClientCreateDto;

public class ClientListDto : ClientCreateDto
{
    public int Id { get; set; }
}

public class ClientDtoToObjProfile : Profile
{
    public ClientDtoToObjProfile()
    {
        CreateMap<ClientCreateDto, Client>();
        CreateMap<Client, ClientCreateDto>();

        CreateMap<Client, ClientListDto>();

        CreateMap<ClientUpdateDto, Client>();
    }
}

public class ClientCreateDtoValidator : AbstractValidator<ClientCreateDto>
{
    public ClientCreateDtoValidator()
    {
        RuleFor(x => x.Name).NotNull().MinimumLength(3);
        RuleFor(x => x.Gender).NotNull().IsInEnum();
        RuleFor(x => x.ApproxAge).NotNull().InclusiveBetween(0, 100);
    }
}

public class ClientUpdateDtoValidator : AbstractValidator<ClientUpdateDto>
{
    public ClientUpdateDtoValidator()
    {
        RuleFor(x => x.Name).MinimumLength(3).When(x => x.Name is not null);
        RuleFor(x => x.Gender).IsInEnum().When(x => x.Gender is not null);
        RuleFor(x => x.ApproxAge).InclusiveBetween(0, 100).When(x => x.ApproxAge is not null);
    }
}