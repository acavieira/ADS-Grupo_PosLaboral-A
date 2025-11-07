using GitDashBackend.Domain.DTOs;

namespace GitDashBackend.Accessors.Interfaces;

public interface IGitHubAccessor
{
    Task<RepositoriesDto> GetUserRepositoriesAsync(string token);
    Task<IEnumerable<CommitDto>> GetRepositoryCommitsByFullNameAsync(string token, string fullName);
    Task<IEnumerable<CollaboratorDto>> GetRepositoryCollaboratorsAsync(string token, string fullName, string timeRange);
}