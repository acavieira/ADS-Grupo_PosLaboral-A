using GitDashBackend.Domain.DTOs;

namespace GitDashBackend.Accessors.Interfaces;

public interface IGitHubAccessor
{
    Task<IEnumerable<RepositoryDto>> GetUserRepositoriesAsync(string token);
    Task<IEnumerable<CommitDto>> GetRepositoryCommitsAsync(string token, string owner, string repo);
}