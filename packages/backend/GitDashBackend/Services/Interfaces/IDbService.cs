using GitDashBackend.Models;

namespace GitDashBackend.Services.Interfaces;

public interface IDbService
{
    Task<User?> GetUserbyUsername(string username);

    void UpsertVisitedRepository(String decodedFullName, int userId);

    void InsertNewLog(int userId, string visitedEndpoint);
}