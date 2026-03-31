using BetterDraxAger.Api.Entities;

namespace BetterDraxAger.Api.Services;

public interface ITokenService
{
    string GenerateToken(ApplicationUser user);
}
