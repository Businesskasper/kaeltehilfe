using AutoMapper;
using FluentValidation;
using kaeltehilfe_backend.Models;

namespace kaeltehilfe_backend.Features.Logins;

public class LoginDto
{
    public string Username { get; set; } = "";
    public Role Role { get; set; }
    public string? Email { get; set; }
    public string? Firstname { get; set; }
    public string? Lastname { get; set; }
    public string? RegistrationNumber { get; set; }
    public DateTime CreateOn { get; set; }
    public DateTime? LastLoginOn { get; set; }
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
    public string? Firstname { get; set; }
    public string? Lastname { get; set; }
    public string? Email { get; set; }
}

public class LoginDtoToObjProfile : Profile
{
    public LoginDtoToObjProfile()
    {
        CreateMap<AdminLogin, LoginDto>().ForMember(l => l.Role, m => m.MapFrom(dto => Role.ADMIN));

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
                                $"{dto.Firstname?.ToLower()}.{dto.Lastname?.ToLower()}@kaeltehilfe.de",
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

public class LoginUpdateDtoValidator : AbstractValidator<LoginUpdateDto>
{
    public LoginUpdateDtoValidator()
    {
        RuleFor(x => x)
            .Must(dto => dto.Firstname != null || dto.Lastname != null || dto.Email != null)
            .WithMessage("At least one of 'firstname', 'lastname', or 'email' must be provided.");

        When(x => x.Firstname != null, () =>
            RuleFor(x => x.Firstname).MinimumLength(3).WithMessage("'firstname' must be at least 3 characters long.")
        );

        When(x => x.Lastname != null, () =>
            RuleFor(x => x.Lastname).MinimumLength(3).WithMessage("'lastname' must be at least 3 characters long.")
        );

        When(x => x.Email != null, () =>
            RuleFor(x => x.Email).EmailAddress().WithMessage("Invalid email format.")
        );
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
