using GitDashBackend.Domain.DTOs;

namespace GitDashBackend.Accessors.Interfaces;

public interface IGitHubAccessor
{
    Task<RepositoriesDto> GetUserRepositoriesAsync(string token);
    Task<CommitsDto> GetRepositoryCommitsByFullNameAsync(string token, string fullName);
    Task<CollaboratorsDto> GetRepositoryCollaboratorsAsync(string token, string fullName, string timeRange);
    Task<RepoOverviewStatsDto> GetRepositoryStatsAsync(string token, string fullName, string timeRange);
}