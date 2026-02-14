using FluentValidation;
using kaeltehilfe_backend.Features.Distributions;
using kaeltehilfe_backend.Models;
using NetTopologySuite.Geometries;

namespace kaeltehilfe_backend.Features.BatchDistributions;

public class BatchDistributionCreateDto
{
    public string LocationName { get; set; } = "";
    public GeoLocationDto? GeoLocation { get; set; }
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
        // RuleFor(b => b)
        //     .Must(b => !(String.IsNullOrWhiteSpace(b.LocationName) && b.GeoLocation == null))
        //     .WithMessage("Either Location.LocationName or GeoLocation must be provided");
        RuleFor(d => d.LocationName).NotNull().NotEmpty();
        RuleFor(d => d.GeoLocation).NotNull();
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
