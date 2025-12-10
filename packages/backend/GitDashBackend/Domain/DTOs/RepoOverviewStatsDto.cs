namespace GitDashBackend.Domain.DTOs;

public class RepoOverviewStatsDto
{
    public KpisDto Kpis { get; set; } = new();
    public OpenWorkDto OpenWork { get; set; } = new();
    public PeakActivityDto PeakActivity { get; set; } = new();
}