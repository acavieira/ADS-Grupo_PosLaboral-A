using GitDashBackend.Accessors.Interfaces;
using GitDashBackend.Domain.DTOs;
using GitDashBackend.Services.Interfaces;

namespace GitDashBackend.Services.Implementations;

public class GitHubService : IGitHubService
{
    private readonly IGitHubAccessor _gitHubAccessor;
    private readonly IRedisAccessor _redisAccessor;
    private readonly ILogger<GitHubService> _logger;
    private readonly TimeSpan _cacheExpiration = TimeSpan.FromMinutes(10);

    public GitHubService(
        IGitHubAccessor gitHubAccessor,
        IRedisAccessor redisAccessor,
        ILogger<GitHubService> logger)
    {
        _gitHubAccessor = gitHubAccessor;
        _redisAccessor = redisAccessor;
        _logger = logger;
    }

    public async Task<IEnumerable<RepositoryDto>> GetUserRepositoriesAsync(string token)
    {
        var cacheKey = $"repos_{token.GetHashCode()}";

        // Try to get from cache
        var cachedData = await _redisAccessor.GetAsync<IEnumerable<RepositoryDto>>(cacheKey);
        if (cachedData != null)
        {
            _logger.LogInformation("Returning repositories from cache");
            return cachedData;
        }

        // If not in cache, fetch from GitHub
        _logger.LogInformation("Cache miss - fetching from GitHub API");
        var repositories = await _gitHubAccessor.GetUserRepositoriesAsync(token);

        // Store in cache
        var userRepositoriesAsync = repositories.ToList();
        await _redisAccessor.SetAsync(cacheKey, userRepositoriesAsync, _cacheExpiration);

        return userRepositoriesAsync;
    }
}