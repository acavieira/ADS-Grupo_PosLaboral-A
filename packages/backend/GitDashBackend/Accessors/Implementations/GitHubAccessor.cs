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

    public async Task<IEnumerable<RepositoryDto>> GetUserRepositoriesAsync(string token)
    {
        _logger.LogInformation("Fetching repositories from GitHub API");

        var client = CreateClient(token);
        var repos = await client.Repository.GetAllForCurrent();

        return repos.Select(r => new RepositoryDto
        {
            Id = r.Id,
            Name = r.Name,
            FullName = r.FullName,
            Description = r.Description,
            HtmlUrl = r.HtmlUrl,
            StargazersCount = r.StargazersCount,
            ForksCount = r.ForksCount,
            Language = r.Language ?? string.Empty,
            CreatedAt = r.CreatedAt.DateTime,
            UpdatedAt = r.UpdatedAt.DateTime
        }).ToList();
    }

    public async Task<IEnumerable<CommitDto>> GetRepositoryCommitsByFullNameAsync(string token, string fullName)
    {
        _logger.LogInformation("Fetching commits for {FullName}", fullName);

        // Parse fullName (format: "owner/repo")
        var parts = fullName.Split('/');
        if (parts.Length != 2)
        {
            throw new ArgumentException($"Invalid repository fullName format: {fullName}. Expected format: 'owner/repo'");
        }

        var owner = parts[0];
        var repo = parts[1];

        var client = CreateClient(token);
        var commits = await client.Repository.Commit.GetAll(owner, repo);

        return commits.Select(c => new CommitDto
        {
            Sha = c.Sha,
            Message = c.Commit.Message,
            AuthorName = c.Commit.Author.Name,
            AuthorEmail = c.Commit.Author.Email,
            Date = c.Commit.Author.Date.DateTime,
            Additions = c.Stats?.Additions ?? 0,
            Deletions = c.Stats?.Deletions ?? 0,
            TotalChanges = (c.Stats?.Additions ?? 0) + (c.Stats?.Deletions ?? 0)
        }).ToList();
    }
}