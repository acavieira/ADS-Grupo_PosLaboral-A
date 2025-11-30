using GitDashBackend.Models;
using GitDashBackend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace GitDashBackend.Services.Implementations;

public class DbService : IDbService
{
    private readonly Data.AppDbContext _dbContext;
    
    public DbService(Data.AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }
    
    public async Task<User?> GetUserbyUsername(string username)
    {
        return await _dbContext.Users.SingleOrDefaultAsync(u => u.Username == username);
    }

    // Upsert Repository
    public async void UpsertVisitedRepository(String decodedFullName, int userId)
    {
        var now = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
        
        // Check if this specific user already has this repository in the DB
        var existingRepo = await _dbContext.Repositories
            .FirstOrDefaultAsync(r => r.Name == decodedFullName && r.UserId == userId);

        if (existingRepo != null)
        {
            // UPDATE: Repo exists, just update the timestamp and visitnumber
            existingRepo.LastVisited = now;
            existingRepo.VisitsNumber = ++existingRepo.VisitsNumber;
        }
        else
        {
            // INSERT: Repo does not exist, create new entry
            var newRepo = new Models.Repository
            {
                Name = decodedFullName, // Assuming the column is 'Name' or 'FullName'
                UserId = userId,
                LastVisited = now,
                VisitsNumber = 1,
                Created = now
            };
            _dbContext.Repositories.Add(newRepo);
            
        }
    }

    public void InsertNewLog(int userId, string visitedEndpoint)
    {
        _dbContext.Logs.Add(new Models.Log
        {
            UserId = userId,
            VisitedEndpoint = visitedEndpoint,
            Created = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)
        });
    }
}