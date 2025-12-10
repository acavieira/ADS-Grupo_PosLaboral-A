using GitDashBackend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GitDashBackend.Models; // Import your models

[Route("api/[controller]")]
[ApiController]
public class DbController : ControllerBase
{
    private readonly AppDbContext _context;

    // The DbContext is injected by the service container
    public DbController(AppDbContext context)
    {
        _context = context;
    }

    //*** USER endpoins ***//

    // GET: api/Db/user
    [HttpGet("user")]
    public async Task<ActionResult<IEnumerable<User>>> GetUsers()
    {
        // This queries your existing 'user' table!
        return await _context.Users.ToListAsync();
    }


    // GET: api/Db/user/{username}
    [HttpGet("user/{username}")]
    public async Task<ActionResult<User>> GetUserByUsername(string username)
    {
        // 1. Query the Users table.
        var user = await _context.Users
            .Where(u => u.Username == username)
            .SingleOrDefaultAsync();

        // 2. Check for the result.
        if (user == null)
        {
            return NotFound($"User with username '{username}' not found.");
        }

        return user;
    }

    //*** LOG endpoins ***//

    // GET: api/Db/log
    [HttpGet("log")]
    public async Task<ActionResult<IEnumerable<Log>>> GetLogs()
    {
        return await _context.Logs
        .Include(log => log.User)
        .ToListAsync();
    }

    // GET: api/Db/log/{id}
    [HttpGet("log/{id}")]
    public async Task<ActionResult<Log>> GetLog(int id)
    {
        // Use .Include() before searching to explicitly load the related User entity.
        var log = await _context.Logs
            .Include(l => l.User)
            .Where(l => l.Id == id)
            .FirstOrDefaultAsync();

        if (log == null)
        {
            return NotFound();
        }

        return log;
    }

    // GET: api/user/{username}/logs
    [HttpGet("user/{username}/logs")]
    public async Task<ActionResult<IEnumerable<Log>>> GetLogsByUsername(string username)
    {

        var logs = await _context.Logs
            .Include(l => l.User) 
            .Where(l => l.User.Username == username)
            .ToListAsync();

        // 3. Check for results.
        if (logs == null || !logs.Any())
        {
            // Return 404 if no logs are found for that username.
            return NotFound($"No logs found for user: {username}");
        }

        return logs;
    }


    //*** REPOSITORY endpoins ***//

    // GET: api/Db/repository
    [HttpGet("repository")]
    public async Task<ActionResult<IEnumerable<Repository>>> GetRepositories()
    {
        return await _context.Repositories
        .Include(repository => repository.User)
        .ToListAsync();
    }

    // GET: api/Db/repository/{id}
    [HttpGet("repository/{id}")]
    public async Task<ActionResult<Repository>> GetRepository(int id)
    {
        // Use .Include() before searching to explicitly load the related User entity.
        var repository = await _context.Repositories
            .Include(r => r.User)
            .Where(r => r.Id == id)
            .FirstOrDefaultAsync();

        if (repository == null)
        {
            return NotFound();
        }

        return repository;
    }

    [HttpGet("user/{username}/repositories")]
    public async Task<ActionResult<IEnumerable<Repository>>> GetRepositoriesByUsername(
        string username,
        [FromQuery] string? sortOrder, // Nullable: defaults to null if not sent
        [FromQuery] int? limit)        // Nullable: defaults to null if not sent
    {
        // 1. Start building the query
        var query = _context.Repositories
            .Include(r => r.User)
            .Where(r => r.User.Username == username);

        // 2. Apply Sorting ONLY if sortOrder is provided
        if (!string.IsNullOrWhiteSpace(sortOrder))
        {
            switch (sortOrder.ToLower())
            {
                case "asc":
                    query = query.OrderBy(r => r.LastVisited);
                    break;
                case "desc":
                    query = query.OrderByDescending(r => r.LastVisited);
                    break;
                // If the string is something else (e.g. "random"), we do nothing 
                // and leave the default database order.
            }
        }

        // 3. Apply Limit ONLY if a limit is provided
        if (limit.HasValue && limit.Value > 0)
        {
            query = query.Take(limit.Value);
        }

        // 4. Execute Query
        var repositories = await query.ToListAsync();

        // 5. Check results
        if (repositories == null || !repositories.Any())
        {
            return NotFound($"No repositories found for user: {username}");
        }

        return repositories;
    }
}