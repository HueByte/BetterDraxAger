namespace BetterDraxAger.Api.DTOs;

public record LeaderboardEntry(int Rank, string Username, int Clicks);
public record LeaderboardResponse(List<LeaderboardEntry> Entries);
