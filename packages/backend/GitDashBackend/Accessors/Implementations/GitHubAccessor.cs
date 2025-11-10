using GitDashBackend.Accessors.Interfaces;
using GitDashBackend.Domain.DTOs;
using Octokit;
using System.Linq;

namespace GitDashBackend.Accessors.Implementations;

public class GitHubAccessor : IGitHubAccessor
{
    private readonly ILogger<GitHubAccessor> _logger;

    public GitHubAccessor(ILogger<GitHubAccessor> logger)
    {
        _logger = logger;
    }

    private GitHubClient CreateClient(string token)
    {
        return new GitHubClient(new ProductHeaderValue("GitDashBackend"))
        {
            Credentials = new Credentials(token)
        };
    }

    public async Task<RepositoriesDto> GetUserRepositoriesAsync(string token)
    {
        _logger.LogInformation("Fetching repositories from GitHub API");

        var client = CreateClient(token);
        var repos = await client.Repository.GetAllForCurrent();

        //var result = new List<RepositoryDto>();
        RepositoriesDto repositoriesDto = new ();

        foreach (var repo in repos)
        {
            // Busca as linguagens do repositório
            var languages = await client.Repository.GetAllLanguages(repo.Owner.Login, repo.Name);

            repositoriesDto.repositories.Add(new RepositoryDto
            {
                FullName = repo.FullName,
                Description = repo.Description ?? string.Empty,
                IsPrivate = repo.Private,
                Starred = repo.StargazersCount,
                Forked = repo.ForksCount,
                Languages = languages.Select(l => l.Name).ToList()
            });

            repositoriesDto.count++;
        }

        return repositoriesDto;
    }

    public async Task<CommitsDto> GetRepositoryCommitsByFullNameAsync(string token, string fullName)
    {
        _logger.LogInformation("Fetching commits for {FullName}", fullName);

        var (owner, repo) = ParseFullName(fullName);

        var client = CreateClient(token);
        var commits = await client.Repository.Commit.GetAll(owner, repo);

        var commitsDto = new CommitsDto();
        
        foreach (var commit in commits)
        {
            commitsDto.commits.Add(new CommitDto
            {
                Message = commit.Commit.Message,
                AuthorName = commit.Commit.Author.Name,
                AuthorEmail = commit.Commit.Author.Email,
                Date = commit.Commit.Author.Date.DateTime,
                Additions = commit.Stats?.Additions ?? 0,
                Deletions = commit.Stats?.Deletions ?? 0,
                TotalChanges = (commit.Stats?.Additions ?? 0) + (commit.Stats?.Deletions ?? 0)
            });
            
            commitsDto.count++;
        }

        return commitsDto;
    }
    
    public async Task<CollaboratorsDto> GetRepositoryCollaboratorsAsync(string token, string fullName, string timeRange)
    {
        var (owner, repo) = ParseFullName(fullName);
        _logger.LogInformation("Fetching collaborators for {FullName}", fullName);

        var client = CreateClient(token);

        var collaborators = await client.Repository.Collaborator.GetAll(owner, repo);

        var collaboratorsDto = new CollaboratorsDto();
        
        foreach (var collaborator in collaborators)
        {
            var login = collaborator.Login;

            var commitCount = (await client.Repository.Commit.GetAll(owner, repo, new CommitRequest
            {
                Author = login,
                Since = GetStartDateFromTimeRange(timeRange)
            })).Count;

            var pullRequests = (await client.Search.SearchIssues(new SearchIssuesRequest
            {
                Type = IssueTypeQualifier.PullRequest,
                Author = login,
                Repos = { $"{owner}/{repo}" }
            })).TotalCount;
            
            var issues = (await client.Search.SearchIssues(new SearchIssuesRequest
            {
                Type = IssueTypeQualifier.Issue,
                Author = login,
                Repos = { $"{owner}/{repo}" }
            })).TotalCount;

            collaboratorsDto.collaborators.Add(new CollaboratorDto
            {
                Login = login,
                AvatarUrl = collaborator.AvatarUrl,
                Role = collaborator.Permissions.Admin ? "admin" : collaborator.Permissions.Push ? "write" : "read",
                Commits = commitCount,
                PullRequests = pullRequests,
                Issues = issues
            });
            collaboratorsDto.count++;
        }

        return collaboratorsDto;
    }
    
    
    public async Task<RepoOverviewStatsDto> GetRepositoryStatsAsync(string token, string fullName, string timeRange)
    {
        var (owner, repo) = ParseFullName(fullName);
        _logger.LogInformation("Fetching repository overview for {FullName}", fullName);

        var client = CreateClient(token);
        var overview = new RepoOverviewStatsDto();

        // === KPI METRICS ===
        // Commits (for the selected time range)
        var commits = await client.Repository.Commit.GetAll(owner, repo, new CommitRequest
        {
            Since = GetStartDateFromTimeRange(timeRange)
        });
        overview.Kpis.Commits = commits.Count;

        // Pull Requests merged
        var mergedPrs = await client.Search.SearchIssues(new SearchIssuesRequest
        {
            Type = IssueTypeQualifier.PullRequest,
            Repos = { $"{owner}/{repo}" },
            State = ItemState.Closed,
            Is = new List<IssueIsQualifier> { IssueIsQualifier.Merged }
        });
        overview.Kpis.PrsMerged = mergedPrs.TotalCount;

        // Issues closed
        var closedIssues = await client.Search.SearchIssues(new SearchIssuesRequest
        {
            Type = IssueTypeQualifier.Issue,
            Repos = { $"{owner}/{repo}" },
            State = ItemState.Closed
        });
        
        overview.Kpis.IssuesClosed = closedIssues.TotalCount;
        
        // === OPEN WORK ===
        // Open PRs
        var openPrs = await client.Search.SearchIssues(new SearchIssuesRequest
        {
            Type = IssueTypeQualifier.PullRequest,
            Repos = { $"{owner}/{repo}" },
            State = ItemState.Open
        });
        overview.OpenWork.OpenPrs = openPrs.TotalCount;

        // Open Issues
        var openIssues = await client.Search.SearchIssues(new SearchIssuesRequest
        {
            Type = IssueTypeQualifier.Issue,
            Repos = { $"{owner}/{repo}" },
            State = ItemState.Open
        });
        overview.OpenWork.OpenIssues = openIssues.TotalCount;

        // PRs needing review (open PRs with review requests)
        var needsReview = await client.Search.SearchIssues(new SearchIssuesRequest
        {
            Type = IssueTypeQualifier.PullRequest,
            Repos = { $"{owner}/{repo}" },
            State = ItemState.Open,
            //Is = new List<IssueIsQualifier> { IssueIsQualifier.Unreviewed }
        });
        overview.OpenWork.NeedsReview = needsReview.TotalCount;

        // === PEAK ACTIVITY ===
        // Most active day and hour — using punch card stats
        var punchCards = await client.Repository.Statistics.GetPunchCard(owner, repo);
        //var commitsd = await client.Repository.Statistics.GetCommitActivity(owner, repo);
        var punchPoints = punchCards.PunchPoints;
        //punchCards.PunchPoints.
        if (punchPoints != null && punchPoints.Any())
        {
            var maxActivity = punchPoints.OrderByDescending(p => p.CommitCount).First();
            overview.PeakActivity.MostActiveDay = maxActivity.DayOfWeek.StringValue;
            overview.PeakActivity.PeakHourUtc = $"{maxActivity.HourOfTheDay:D2}:00 - {maxActivity.HourOfTheDay + 1:D2}:00"; 
        }


        // Team size
        var collaborators = await client.Repository.Collaborator.GetAll(owner, repo);
        overview.PeakActivity.TeamSize = collaborators.Count;
        
        return overview;
    }

    private static DateTime GetStartDateFromTimeRange(string timeRange)
    {
        return timeRange switch
        {
            "1 week" => DateTime.UtcNow.AddDays(-7),
            "1 month" => DateTime.UtcNow.AddMonths(-1),
            "3 months" => DateTime.UtcNow.AddMonths(-3),
            _ => throw new ArgumentException("Invalid time range. Accepted values: '1 week', '1 month', '3 months'")
        };
    }
    
    private (string owner, string repo) ParseFullName(string fullName)
    {
        if (string.IsNullOrEmpty(fullName) || !fullName.Contains('/'))
        {
            throw new ArgumentException($"Invalid repository fullName format: {fullName}. Expected format: 'owner/repo'");
        }

        var parts = fullName.Split('/');
        return (parts[0], parts[1]);
    }    
}