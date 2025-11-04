using GitDashBackend.Domain.DTOs;

namespace GitDashBackend.Services.Interfaces;

public interface IGitHubService
{
    Task<IEnumerable<RepositoryDto>> GetUserRepositoriesAsync(string token);
}