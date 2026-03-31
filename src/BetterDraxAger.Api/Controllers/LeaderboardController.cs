using BetterDraxAger.Api.Data;
using BetterDraxAger.Api.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BetterDraxAger.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LeaderboardController : ControllerBase
{
    private readonly AppDbContext _db;

    public LeaderboardController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] int top = 10)
    {
        top = Math.Clamp(top, 1, 50);

        var users = await _db.Users
            .Where(u => u.TotalClicks > 0)
            .OrderByDescending(u => u.TotalClicks)
            .Take(top)
            .Select(u => new { u.UserName, u.TotalClicks })
            .ToListAsync();

        var entries = users
            .Select((u, i) => new LeaderboardEntry(i + 1, u.UserName!, u.TotalClicks))
            .ToList();

        return Ok(new LeaderboardResponse(entries));
    }
}
