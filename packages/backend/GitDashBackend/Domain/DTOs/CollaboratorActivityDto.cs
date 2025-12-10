namespace GitDashBackend.Domain.DTOs;

public class CollaboratorActivityDto
{
    public CommitStats commits { get; set; } = new();
    public PullRequestStats pullRequests { get; set; } = new();
    public IssueStats issues { get; set; } = new();
    public ReviewStats reviews { get; set; } = new();
}

public class CommitStats
{
    public int totalCount { get; set; }
}

public class PullRequestStats
{
    public int totalCount { get; set; }
    public int mergedCount { get; set; }
}

public class IssueStats
{
    public int totalCount { get; set; }
    public int closedCount { get; set; }
}

public class ReviewStats
{
    public int givenCount { get; set; }
}