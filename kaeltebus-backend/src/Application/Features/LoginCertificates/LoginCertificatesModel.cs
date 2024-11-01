using AutoMapper;
using FluentValidation;
using kaeltebus_backend.Models;

namespace kaeltebus_backend.Features.LoginCertificates;

public class CreateLoginCertificateRequest
{
    public string LoginUsername { get; set; } = "";
    public string Description { get; set; } = "";
    public string PfxPassword { get; set; } = "";
}

public class LoginCertificateDto
{
    public int Id { get; set; }
    public string Thumbprint { get; set; } = "";
    public string Description { get; set; } = "";
    public DateTime ValidFrom { get; set; }
    public DateTime ValidTo { get; set; }
    public string LoginUsername { get; set; } = "";
    public CertificateStatus Status { get; set; } = CertificateStatus.ACTIVE;
}

public class LoginCertificateContentDto
{
    public string FileName { get; set; } = "";
    public string EncodedCertChain { get; set; } = "";
}

public class CreateCertValidator : AbstractValidator<CreateLoginCertificateRequest>
{
    public CreateCertValidator()
    {
        RuleFor(l => l.LoginUsername).NotEmpty();
        RuleFor(l => l.PfxPassword).NotEmpty().MinimumLength(8);
    }
}

public class LoginCertificateDtoProfile : Profile
{
    public LoginCertificateDtoProfile()
    {
        CreateMap<LoginCertificate, LoginCertificateDto>();
    }
}
