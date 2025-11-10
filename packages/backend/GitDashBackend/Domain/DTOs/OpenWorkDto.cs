namespace GitDashBackend.Domain.DTOs;

public class OpenWorkDto
{
    public int OpenPrs { get; set; }
    public int OpenIssues { get; set; }
    public int NeedsReview { get; set; }
}