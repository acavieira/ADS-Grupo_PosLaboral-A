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

    public async Task<IEnumerable<RepositoryDto>> GetUserRepositoriesAsync(string token)
    {
        _logger.LogInformation("Fetching repositories from GitHub API");

        var client = new GitHubClient(new ProductHeaderValue("GitDashBackend"))
        {
            Credentials = new Credentials(token)
        };

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
}