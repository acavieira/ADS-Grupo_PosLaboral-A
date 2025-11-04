using GitDashBackend.Domain.DTOs;

namespace GitDashBackend.Accessors.Interfaces;

public interface IGitHubAccessor
{
    Task<IEnumerable<RepositoryDto>> GetUserRepositoriesAsync(string token);
    Task<IEnumerable<CommitDto>> GetRepositoryCommitsByFullNameAsync(string token, string fullName);
}