using BetterDraxAger.Api.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace BetterDraxAger.Api.Data;

public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<ClickRecord> ClickRecords => Set<ClickRecord>();
    public DbSet<SiteStats> SiteStats => Set<SiteStats>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<ClickRecord>(e =>
        {
            e.HasOne(c => c.User)
             .WithMany()
             .HasForeignKey(c => c.UserId)
             .IsRequired();
        });

        builder.Entity<SiteStats>().HasData(new SiteStats { Id = 1, TotalClicks = 0 });
    }
}
