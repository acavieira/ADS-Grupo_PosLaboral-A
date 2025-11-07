using GitDashBackend.Accessors.Interfaces;
using GitDashBackend.Domain.DTOs;
using Octokit;

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

    public async Task<IEnumerable<CommitDto>> GetRepositoryCommitsByFullNameAsync(string token, string fullName)
    {
        _logger.LogInformation("Fetching commits for {FullName}", fullName);

        var (owner, repo) = ParseFullName(fullName);

        var client = CreateClient(token);
        var commits = await client.Repository.Commit.GetAll(owner, repo);

        return commits.Select(c => new CommitDto
        {
            Message = c.Commit.Message,
            AuthorName = c.Commit.Author.Name,
            AuthorEmail = c.Commit.Author.Email,
            Date = c.Commit.Author.Date.DateTime,
            Additions = c.Stats?.Additions ?? 0,
            Deletions = c.Stats?.Deletions ?? 0,
            TotalChanges = (c.Stats?.Additions ?? 0) + (c.Stats?.Deletions ?? 0)
        }).ToList();
    }
    
    
    public async Task<IEnumerable<CollaboratorDto>> GetRepositoryCollaboratorsAsync(string token, string fullName, string timeRange)
    {
        var (owner, repo) = ParseFullName(fullName);
        _logger.LogInformation("Fetching collaborators for {FullName}", fullName);

        var client = CreateClient(token);

        var collaborators = await client.Repository.Collaborator.GetAll(owner, repo);

        var result = new List<CollaboratorDto>();
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

            result.Add(new CollaboratorDto
            {
                Login = login,
                AvatarUrl = collaborator.AvatarUrl,
                Role = collaborator.Permissions.Admin ? "admin" : collaborator.Permissions.Push ? "write" : "read",
                Commits = commitCount,
                PullRequests = pullRequests,
                Issues = issues
            });
        }

        return result;
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