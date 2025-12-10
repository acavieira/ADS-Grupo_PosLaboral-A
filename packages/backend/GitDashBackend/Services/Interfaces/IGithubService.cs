using GitDashBackend.Domain.DTOs;

namespace GitDashBackend.Services.Interfaces;

public interface IGitHubService
{
    Task<RepositoriesDto> GetUserRepositoriesAsync(string token);
    Task<CommitsDto> GetRepositoryCommitsByFullNameAsync(string token, string fullName);
    Task<CollaboratorsDto> GetRepositoryCollaboratorsAsync(string token, string fullName, string timeRange);
    Task<RepoOverviewStatsDto> GetRepositoryStatsAsync(string token, string fullName, string timeRange);
    Task<WeeklyActivityDto?> GetCollaboratorWeeklyActivityAsync(string token, string fullName, string username);
    Task<CollaboratorActivityDto?> GetCollaboratorActivityAsync(string token, string fullName, string username, string range);
    Task<RepositoryDto?> GetRepositoryByOwnerRepoAsync(string token, string ownerRepo);
    Task<CollaboratorCodeChangesDto?> GetCollaboratorCodeChangesAsync(string token, string fullName, string username, string range);

}