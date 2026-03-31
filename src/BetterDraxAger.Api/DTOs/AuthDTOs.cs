using System.ComponentModel.DataAnnotations;

namespace BetterDraxAger.Api.DTOs;

public record RegisterRequest(
    [Required] string Username,
    [Required] string Password
);

public record LoginRequest(
    [Required] string Username,
    [Required] string Password
);

public record AuthResponse(
    string Token,
    string Username,
    DateTime ExpiresAt
);

public record ErrorResponse(List<string> Errors);
