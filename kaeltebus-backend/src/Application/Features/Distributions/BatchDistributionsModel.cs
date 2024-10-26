using FluentValidation;
using kaeltebus_backend.Models;

namespace kaeltebus_backend.Features.BatchDistributions;

public class BatchDistributionCreateDto
{
    public string LocationName { get; set; } = "";
    public string BusRegistrationNumber { get; set; } = "";
    public List<BatchDistributionClientDto> Clients { get; set; } = [];
    public List<BatchDistributionGoodDto> Goods { get; set; } = [];
}

public class BatchDistributionClientDto
{
    public int? Id { get; set; }
    public string Name { get; set; } = "";
    public Gender? Gender { get; set; }
    public int ApproxAge { get; set; }
}

public class BatchDistributionGoodDto
{
    public int Id { get; set; }
    public int Quantity { get; set; }
}

public class BatchDistributionCreateDtoValidator : AbstractValidator<BatchDistributionCreateDto>
{
    public BatchDistributionCreateDtoValidator()
    {
        RuleFor(b => b.LocationName).NotNull().NotEmpty();
        RuleFor(d => d.Clients).NotNull().NotEmpty();
        RuleForEach(d => d.Clients).SetValidator(new BatchDistributionClientDtoValidator());
        RuleFor(d => d.Goods).NotNull().NotEmpty();
        RuleForEach(d => d.Goods).SetValidator(new BatchDistributionGoodDtoValidator());
        RuleFor(d => d.BusRegistrationNumber).NotEmpty().MinimumLength(5);
    }
}

public class BatchDistributionGoodDtoValidator : AbstractValidator<BatchDistributionGoodDto>
{
    public BatchDistributionGoodDtoValidator()
    {
        RuleFor(g => g.Id).NotEmpty();
        RuleFor(g => g.Quantity).NotEmpty();
    }
}

public class BatchDistributionClientDtoValidator : AbstractValidator<BatchDistributionClientDto>
{
    public BatchDistributionClientDtoValidator()
    {
        RuleFor(c => c.Id).NotNull().When(c => String.IsNullOrWhiteSpace(c.Name));
        RuleFor(c => c.Name).NotEmpty();
        RuleFor(c => c.ApproxAge).NotEmpty();
    }
}
