using GitDashBackend.Accessors.Interfaces;
using GitDashBackend.Domain.DTOs;
using GitDashBackend.Services.Interfaces;

namespace GitDashBackend.Services.Implementations;

public class GitHubService : IGitHubService
{
    private readonly IGitHubAccessor _gitHubAccessor;
    private readonly IRedisAccessor _redisAccessor;
    private readonly ILogger<GitHubService> _logger;
    private readonly TimeSpan _cacheExpiration = TimeSpan.FromMinutes(30);

    public GitHubService(
        IGitHubAccessor gitHubAccessor,
        IRedisAccessor redisAccessor,
        ILogger<GitHubService> logger)
    {
        _gitHubAccessor = gitHubAccessor;
        _redisAccessor = redisAccessor;
        _logger = logger;
    }

    public async Task<RepositoriesDto> GetUserRepositoriesAsync(string token)
    {
        var cacheKey = $"repos_{token.GetHashCode()}";
        return await GetOrFetchSingleAsync(cacheKey, () => _gitHubAccessor.GetUserRepositoriesAsync(token));
    }

    public async Task<CommitsDto> GetRepositoryCommitsByFullNameAsync(string token, string fullName)
    {
        var cacheKey = $"commits_{fullName.Replace("/", "_")}_{token.GetHashCode()}";
        return await GetOrFetchSingleAsync(cacheKey, () => _gitHubAccessor.GetRepositoryCommitsByFullNameAsync(token, fullName));
    }
    
    public async Task<CollaboratorsDto> GetRepositoryCollaboratorsAsync(string token, string fullName, string timeRange)
    {
        var cacheKey = $"collaborators_{fullName.Replace("/", "_")}_{timeRange}_{token.GetHashCode()}";
        return await GetOrFetchSingleAsync(cacheKey, () => _gitHubAccessor.GetRepositoryCollaboratorsAsync(token, fullName, timeRange));
    }

    // Generic cache helper for collections
    private async Task<IEnumerable<T>> GetOrFetchAsync<T>(string cacheKey, Func<Task<IEnumerable<T>>> fetchFunc)
    {
        var cachedData = await _redisAccessor.GetAsync<IEnumerable<T>>(cacheKey);
        if (cachedData != null)
        {
            _logger.LogInformation("Returning data from cache for key: {CacheKey}", cacheKey);
            return cachedData;
        }

        _logger.LogInformation("Cache miss - fetching from GitHub API for key: {CacheKey}", cacheKey);
        var data = await fetchFunc();
        var dataList = data.ToList();
        
        await _redisAccessor.SetAsync(cacheKey, dataList, _cacheExpiration);
        return dataList;
    }

    // Generic cache helper for single objects
    private async Task<T> GetOrFetchSingleAsync<T>(string cacheKey, Func<Task<T>> fetchFunc) where T : class
    {
        var cachedData = await _redisAccessor.GetAsync<T>(cacheKey);
        if (cachedData != null)
        {
            _logger.LogInformation("Returning data from cache for key: {CacheKey}", cacheKey);
            return cachedData;
        }

        _logger.LogInformation("Cache miss - fetching from GitHub API for key: {CacheKey}", cacheKey);
        var data = await fetchFunc();
        
        await _redisAccessor.SetAsync(cacheKey, data, _cacheExpiration);
        return data;
    }
}