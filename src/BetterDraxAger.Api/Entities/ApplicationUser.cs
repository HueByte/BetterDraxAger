using Microsoft.AspNetCore.Identity;

namespace BetterDraxAger.Api.Entities;

public class ApplicationUser : IdentityUser
{
    public int TotalClicks { get; set; } = 0;
}
