namespace GitDashBackend.Domain.DTOs;

public class KpisDto
{
    public int Commits { get; set; }
    public int PrsMerged { get; set; }
    public int IssuesClosed { get; set; }
}