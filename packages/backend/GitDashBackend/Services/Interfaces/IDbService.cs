using GitDashBackend.Models;

namespace GitDashBackend.Services.Interfaces;

public interface IDbService
{
    Task<User?> GetUserbyUsername(string username);

    Task UpsertVisitedRepository(String decodedFullName, int userId);

    Task InsertNewLog(int userId, string visitedEndpoint);
}