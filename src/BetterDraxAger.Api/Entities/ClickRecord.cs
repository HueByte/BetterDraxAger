namespace BetterDraxAger.Api.Entities;

public class ClickRecord
{
    public int Id { get; set; }
    public string UserId { get; set; } = null!;
    public ApplicationUser User { get; set; } = null!;
    public DateTime ClickedAt { get; set; }
}
