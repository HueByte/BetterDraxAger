using System.Security.Claims;
using BetterDraxAger.Api.Data;
using BetterDraxAger.Api.DTOs;
using BetterDraxAger.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace BetterDraxAger.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AgeController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ClickBufferService _buffer;

    public AgeController(AppDbContext db, ClickBufferService buffer)
    {
        _db = db;
        _buffer = buffer;
    }

    [HttpGet("total")]
    public async Task<IActionResult> GetTotal()
    {
        var stats = await _db.SiteStats.FindAsync(1);
        return Ok(new TotalResponse(stats?.TotalClicks ?? 0));
    }

    [Authorize]
    [EnableRateLimiting("click")]
    [HttpPost("click")]
    public IActionResult Click()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? User.FindFirstValue(JwtClaimTypes.Sub);

        if (userId is null)
            return Unauthorized();

        _buffer.Enqueue(userId);

        return Ok();
    }
}

// Inline claim type constant to avoid needing Microsoft.IdentityModel.JsonWebTokens directly
file static class JwtClaimTypes
{
    public const string Sub = "sub";
}
