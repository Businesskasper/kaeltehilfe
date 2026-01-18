using System.ComponentModel.DataAnnotations;
using System.Text.Json;
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

public class LoginUpdateDto : Dictionary<string, object> { }

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
        RuleForEach(x => x.Keys)
            .Must(key => key == "firstname" || key == "lastname" || key == "email")
            .WithMessage("Only 'firstname', 'lastname', or 'email' are allowed as keys.");

        RuleFor(x => x)
            .Must(dto =>
                dto.ContainsKey("firstname")
                || dto.ContainsKey("lastname")
                || dto.ContainsKey("email")
            )
            .WithMessage("At least one of 'firstname', 'lastname', or 'email' must be present.");

        When(
            x => x.ContainsKey("firstname"),
            () =>
            {
                RuleFor(x => x["firstname"])
                    .NotNull()
                    .WithMessage("'firstname' cannot be null.")
                    .Must(value =>
                    {
                        if (value is not JsonElement)
                            return false;
                        var parsed = ObjectMethods.GetJsonElementValue((JsonElement)value);
                        return parsed is not null
                            && parsed is string
                            && ((string)parsed).Length >= 3;
                    })
                    .WithMessage(
                        (a, b) => $"{b.GetType()}'firstname' must be at least 3 characters long."
                    );
            }
        );

        When(
            x => x.ContainsKey("lastname"),
            () =>
            {
                RuleFor(x => x["lastname"])
                    .NotNull()
                    .WithMessage("'lastname' cannot be null.")
                    .Must(value =>
                    {
                        if (value is not JsonElement)
                            return false;
                        var parsed = ObjectMethods.GetJsonElementValue((JsonElement)value);
                        return parsed is not null
                            && parsed is string
                            && ((string)parsed).Length >= 3;
                    })
                    .WithMessage("'lastname' must be at least 3 characters long.");
            }
        );

        When(
            x => x.ContainsKey("email"),
            () =>
            {
                RuleFor(x => x["email"])
                    .NotNull()
                    .WithMessage("'email' cannot be null.")
                    .Must(value =>
                    {
                        if (value is not JsonElement)
                            return false;
                        var parsed = ObjectMethods.GetJsonElementValue((JsonElement)value);
                        return parsed is not null && new EmailAddressAttribute().IsValid(parsed);
                    })
                    .WithMessage("Invalid email format.");
            }
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
