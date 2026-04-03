using System.Collections.Concurrent;
using BetterDraxAger.Api.Data;
using BetterDraxAger.Api.DTOs;
using BetterDraxAger.Api.Entities;
using BetterDraxAger.Api.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace BetterDraxAger.Api.Services;

public class ClickBufferService : BackgroundService
{
    private const int FlushThreshold = 200;
    private static readonly TimeSpan IdleTimeout = TimeSpan.FromSeconds(5);

    private readonly ConcurrentQueue<BufferedClick> _queue = new();
    private readonly SemaphoreSlim _signal = new(0);
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IHubContext<AgeHub> _hubContext;

    public ClickBufferService(IServiceScopeFactory scopeFactory, IHubContext<AgeHub> hubContext)
    {
        _scopeFactory = scopeFactory;
        _hubContext = hubContext;
    }

    public void Enqueue(string userId)
    {
        _queue.Enqueue(new BufferedClick(userId, DateTime.UtcNow));
        _signal.Release();
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            // Wait for at least one click or cancellation
            try { await _signal.WaitAsync(stoppingToken); }
            catch (OperationCanceledException) { break; }

            // Drain up to threshold or wait for idle timeout
            var batch = new List<BufferedClick>();
            var deadline = DateTime.UtcNow.Add(IdleTimeout);

            while (batch.Count < FlushThreshold && DateTime.UtcNow < deadline)
            {
                if (_queue.TryDequeue(out var click))
                {
                    batch.Add(click);
                    // Drain any remaining semaphore count for this item
                    _signal.Wait(0);
                    deadline = DateTime.UtcNow.Add(IdleTimeout); // reset idle timer
                }
                else
                {
                    // Wait for next click or idle timeout
                    var remaining = deadline - DateTime.UtcNow;
                    if (remaining <= TimeSpan.Zero) break;
                    try { await _signal.WaitAsync(remaining, stoppingToken); }
                    catch (OperationCanceledException) { break; }

                    // After waking, continue draining
                }
            }

            if (batch.Count > 0)
                await FlushAsync(batch, stoppingToken);
        }

        // Flush remaining on shutdown
        var final = new List<BufferedClick>();
        while (_queue.TryDequeue(out var click))
            final.Add(click);
        if (final.Count > 0)
            await FlushAsync(final, CancellationToken.None);
    }

    private async Task FlushAsync(List<BufferedClick> batch, CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // Group clicks by user
        var grouped = batch.GroupBy(c => c.UserId)
            .Select(g => new { UserId = g.Key, Count = g.Count(), Clicks = g.ToList() })
            .ToList();

        // Insert click records
        var records = batch.Select(c => new ClickRecord { UserId = c.UserId, ClickedAt = c.ClickedAt }).ToList();
        db.ClickRecords.AddRange(records);

        // Update per-user totals atomically
        foreach (var g in grouped)
        {
            await db.Users
                .Where(u => u.Id == g.UserId)
                .ExecuteUpdateAsync(s => s.SetProperty(u => u.TotalClicks, u => u.TotalClicks + g.Count), ct);
        }

        // Update site total atomically
        await db.SiteStats
            .Where(s => s.Id == 1)
            .ExecuteUpdateAsync(s => s.SetProperty(ss => ss.TotalClicks, ss => ss.TotalClicks + batch.Count), ct);

        await db.SaveChangesAsync(ct);

        // Broadcast updated total
        var newTotal = await db.SiteStats
            .Where(s => s.Id == 1)
            .Select(s => s.TotalClicks)
            .FirstAsync(ct);

        await _hubContext.Clients.All.SendAsync("TotalUpdated", newTotal, ct);

        // Broadcast updated leaderboard
        var users = await db.Users
            .Where(u => u.TotalClicks > 0)
            .OrderByDescending(u => u.TotalClicks)
            .Take(50)
            .Select(u => new { u.UserName, u.TotalClicks })
            .ToListAsync(ct);

        var entries = users
            .Select((u, i) => new LeaderboardEntry(i + 1, u.UserName!, u.TotalClicks))
            .ToList();

        await _hubContext.Clients.All.SendAsync("LeaderboardUpdated", entries, ct);
    }

    private record BufferedClick(string UserId, DateTime ClickedAt);
}
