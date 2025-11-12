namespace GitDashBackend.Domain.DTOs;

public class PeakActivityDto
{
    public string? MostActiveDay { get; set; }
    public string? PeakHourUtc { get; set; }
    public int TeamSize { get; set; }
}