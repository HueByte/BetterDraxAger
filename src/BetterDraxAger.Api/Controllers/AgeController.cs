using System.Security.Claims;
using BetterDraxAger.Api.Data;
using BetterDraxAger.Api.DTOs;
using BetterDraxAger.Api.Entities;
using BetterDraxAger.Api.Hubs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace BetterDraxAger.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AgeController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IHubContext<AgeHub> _hubContext;

    public AgeController(AppDbContext db, UserManager<ApplicationUser> userManager, IHubContext<AgeHub> hubContext)
    {
        _db = db;
        _userManager = userManager;
        _hubContext = hubContext;
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
    public async Task<IActionResult> Click()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? User.FindFirstValue(JwtClaimTypes.Sub);

        if (userId is null)
            return Unauthorized();

        _db.ClickRecords.Add(new ClickRecord { UserId = userId, ClickedAt = DateTime.UtcNow });

        await _db.Users
            .Where(u => u.Id == userId)
            .ExecuteUpdateAsync(s => s.SetProperty(u => u.TotalClicks, u => u.TotalClicks + 1));

        await _db.SiteStats
            .Where(s => s.Id == 1)
            .ExecuteUpdateAsync(s => s.SetProperty(ss => ss.TotalClicks, ss => ss.TotalClicks + 1));

        await _db.SaveChangesAsync();

        var newTotal = await _db.SiteStats
            .Where(s => s.Id == 1)
            .Select(s => s.TotalClicks)
            .FirstAsync();

        var yourTotal = await _db.Users
            .Where(u => u.Id == userId)
            .Select(u => u.TotalClicks)
            .FirstAsync();

        await _hubContext.Clients.All.SendAsync("TotalUpdated", newTotal);

        return Ok(new ClickResponse(newTotal, yourTotal));
    }
}

// Inline claim type constant to avoid needing Microsoft.IdentityModel.JsonWebTokens directly
file static class JwtClaimTypes
{
    public const string Sub = "sub";
}
