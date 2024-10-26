using AutoMapper;
using FluentValidation;
using kaeltebus_backend.Models;

namespace kaeltebus_backend.Features.Logins;

public class LoginDto
{
    public string Username { get; set; } = "";
    public Role Role { get; set; }
    public string? Email { get; set; }
    public string? Firstname { get; set; }
    public string? Lastname { get; set; }
    public string? RegistrationNumber { get; set; }
    public DateTime CreateOn { get; set; }
}

public class LoginCreateDto
{
    public Role Role { get; set; }
    public string? Email { get; set; }
    public string? Firstname { get; set; }
    public string? Lastname { get; set; }
    public string? RegistrationNumber { get; set; }
    public string? Password { get; set; }
}

public class LoginUpdateDto
{
    public string? Email { get; set; }
    public string? Firstname { get; set; }
    public string? Lastname { get; set; }
}

public class LoginDtoToObjProfile : Profile
{
    public LoginDtoToObjProfile()
    {
        // CreateMap<LoginCreateDto, AdminLogin>();
        // CreateMap<AdminLogin, LoginCreateDto>()
        //     .ForMember(l => l.Role, m => m.MapFrom(dto => Role.ADMIN));
        CreateMap<AdminLogin, LoginDto>()
            .ForMember(l => l.Role, m => m.MapFrom(dto => Role.ADMIN));

        // CreateMap<LoginCreateDto, OperatorLogin>();
        // CreateMap<OperatorLogin, LoginCreateDto>()
        //     .ForMember(l => l.Role, m => m.MapFrom(dto => Role.OPERATOR));
        CreateMap<OperatorLogin, LoginDto>()
            .ForMember(l => l.Role, m => m.MapFrom(dto => Role.OPERATOR));

        CreateMap<LoginCreateDto, Login>()
            .ConvertUsing(
                (dto, login) =>
                {
                    // Check the role and map to the appropriate subclass
                    return dto.Role switch
                    {
                        Role.ADMIN => new AdminLogin
                        {
                            Username = $"{dto.Firstname?.ToLower()}.{dto.Lastname?.ToLower()}",
                            Firstname = dto.Firstname ?? "",
                            Lastname = dto.Lastname ?? "",
                            Email = dto.Email ?? "",
                        },
                        Role.OPERATOR => new OperatorLogin
                        {
                            Username = $"{dto.Firstname?.ToLower()}.{dto.Lastname?.ToLower()}",
                            RegistrationNumber =
                                dto.RegistrationNumber
                                ?? throw new ArgumentException(
                                    "Registration number is required for operator login"
                                ),
                            Email =
                                $"{dto.Firstname?.ToLower()}.{dto.Lastname?.ToLower()}@kaeltebus.de",
                        },
                        _ => throw new ArgumentException("Invalid role type"),
                    };
                }
            );
    }
}

public class LoginCreateDtoValidator : AbstractValidator<LoginCreateDto>
{
    public LoginCreateDtoValidator()
    {
        RuleFor(l => l.RegistrationNumber)
            .NotNull()
            .MinimumLength(3)
            .When(l => l.Role == Role.OPERATOR);
        RuleFor(l => l.Email).NotNull().EmailAddress().When(l => l.Role == Role.ADMIN);
        RuleFor(l => l.Firstname).NotNull().When(l => l.Role == Role.ADMIN);
        RuleFor(l => l.Lastname).NotNull().When(l => l.Role == Role.ADMIN);
        RuleFor(l => l.Password).MinimumLength(8).When(l => !string.IsNullOrWhiteSpace(l.Password));
    }
}

public class CreateCertRequest
{
    public string PfxPassword { get; set; } = "";
}

public class CreateCertValidator : AbstractValidator<CreateCertRequest>
{
    public CreateCertValidator()
    {
        RuleFor(l => l.PfxPassword).NotEmpty().MinimumLength(8);
    }
}

public class SetPasswordRequest
{
    public string Password { get; set; } = "";
}

public class SetPasswordDtoValidator : AbstractValidator<SetPasswordRequest>
{
    public SetPasswordDtoValidator()
    {
        RuleFor(l => l.Password).NotEmpty().MinimumLength(8);
    }
}
