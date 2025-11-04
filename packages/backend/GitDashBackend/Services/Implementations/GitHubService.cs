using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;
using Octokit;

namespace GitDashBackend.Services.Implementations;

public class GitHubService : IGitHubService
{
    private readonly IDistributedCache _cache;
    private readonly ILogger<GitHubService> _logger;
    private readonly TimeSpan _cacheExpiration = TimeSpan.FromMinutes(10);

    public GitHubService(IDistributedCache cache, ILogger<GitHubService> logger)
    {
        _cache = cache;
        _logger = logger;
    }

    public async Task<IEnumerable<RepositoryDto>> GetUserRepositoriesAsync(string token)
    {
        var cacheKey = $"repos_{token.GetHashCode()}";

        // Try to get from the cache
        var cachedData = await _cache.GetStringAsync(cacheKey);
        if (!string.IsNullOrEmpty(cachedData))
        {
            _logger.LogInformation("Returning repositories from cache");
            return JsonSerializer.Deserialize<IEnumerable<RepositoryDto>>(cachedData) 
                   ?? Enumerable.Empty<RepositoryDto>();
        }

        // If not in cache, fetch from GitHub API
        _logger.LogInformation("Fetching repositories from GitHub API");
        var client = new GitHubClient(new ProductHeaderValue("GitDashBackend"))
        {
            Credentials = new Credentials(token)
        };

        var repos = await client.Repository.GetAllForCurrent();
        
        var repositoryDtos = repos.Select(r => new RepositoryDto
        {
            Id = r.Id,
            Name = r.Name,
            FullName = r.FullName,
            Description = r.Description,
            HtmlUrl = r.HtmlUrl,
            StargazersCount = r.StargazersCount,
            ForksCount = r.ForksCount,
            Language = r.Language ?? "",
            CreatedAt = r.CreatedAt.DateTime,
            UpdatedAt = r.UpdatedAt.DateTime
        }).ToList();

        // Store in cache
        var serializedData = JsonSerializer.Serialize(repositoryDtos);
        var cacheOptions = new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = _cacheExpiration
        };
        await _cache.SetStringAsync(cacheKey, serializedData, cacheOptions);

        return repositoryDtos;
    }
}