using AutoMapper;
using FluentValidation;
using kaeltehilfe_backend.Models;

namespace kaeltehilfe_backend.Features.Clients;

public class ClientDto
{
    public int Id { get; set; }
    public string? Name { get; set; }
    public Gender? Gender { get; set; }
    public int? ApproxAge { get; set; }
    public string? Remarks { get; set; }
}

public class ClientCreateDto
{
    public string? Name { get; set; }
    public Gender? Gender { get; set; }
    public int? ApproxAge { get; set; }
    public string? Remarks { get; set; }
}

public class ClientDtoToObjProfile : Profile
{
    public ClientDtoToObjProfile()
    {
        CreateMap<ClientCreateDto, Client>();
        CreateMap<Client, ClientCreateDto>();

        CreateMap<Client, ClientDto>();
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
