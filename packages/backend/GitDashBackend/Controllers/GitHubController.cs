using GitDashBackend.Domain.DTOs;
using GitDashBackend.Services.Interfaces;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GitDashBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class GitHubController : ControllerBase
{
    private readonly IGitHubService _gitHubService;
    private readonly IDbService _dbService;
    private readonly ILogger<GitHubController> _logger;
    private readonly Data.AppDbContext _dbContext;

    public GitHubController(IGitHubService gitHubService,
        IDbService dbService,
        ILogger<GitHubController> logger,
        Data.AppDbContext dbContext)
    {
        _gitHubService = gitHubService;
        _dbService = dbService;
        _logger = logger;
        _dbContext = dbContext;
    }


    /// <summary>
    /// Retrieves the authenticated user's GitHub repositories.
    /// Uses the GitHub OAuth access token stored in the authentication cookie
    /// (saved automatically during the OAuth login flow).
    /// </summary>
    /// <returns>List of user repositories.</returns>
    [Authorize]
    [HttpGet("repositories")]
    [ProducesResponseType(typeof(RepositoriesDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(object), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(object), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetRepositories()
    {
        // Take token from the same place as /api/github/test
        var accessToken = await HttpContext.GetTokenAsync("access_token");

        if (string.IsNullOrEmpty(accessToken))
        {
            // user is not authenticated via GitHub or token not saved
            return Unauthorized(new { error = "GitHub access token not found. Please login via GitHub first." });
        }

        try
        {
            // Register access log
            var identity = HttpContext.User.Identity as System.Security.Claims.ClaimsIdentity;
            var username = identity?.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
            int? userId = null;
            if (!string.IsNullOrEmpty(username))
            {
                var user = await _dbContext.Users.SingleOrDefaultAsync(u => u.Username == username);
                if (user != null)
                    userId = user.Id;
            }
            _dbContext.Logs.Add(new Models.Log
            {
                UserId = userId ?? 0,
                VisitedEndpoint = HttpContext.Request.Path,
                Created = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)
            });
            await _dbContext.SaveChangesAsync();

            // Fetch repositories
            RepositoriesDto repositories = await _gitHubService.GetUserRepositoriesAsync(accessToken);

            // Update repository visits
            foreach (var repoDto in repositories.repositories)
            {
                var repo = await _dbContext.Repositories.SingleOrDefaultAsync(r => r.Name == repoDto.FullName);
                if (repo != null)
                {
                    repo.VisitsNumber += 1;
                    repo.LastVisited = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
                    _dbContext.Repositories.Update(repo);
                }
            }
            await _dbContext.SaveChangesAsync();

            return Ok(repositories);
        }
        catch (Octokit.AuthorizationException)
        {
            return Unauthorized(new { error = "Invalid or expired GitHub token" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching repositories");
            return StatusCode(500, new { error = "An error occurred while fetching repositories" });
        }
    }


    /// <summary>
    /// Get commits for a specific repository using fullName as a query parameter
    /// </summary>
    /// <param name="fullName">Repository full name in format: owner/repo (e.g., 'acavieira/ADS-Grupo_PosLaboral-A')</param>
    /// <param name="authorization">GitHub Personal Access Token</param>
    /// <returns>List of commits with caching</returns>
    /// <example>GET /api/github/commits?fullName=acavieira/ADS-Grupo_PosLaboral-A</example>
    [Authorize]
    [HttpGet("commits")]
    [ProducesResponseType(typeof(CommitsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(object), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(object), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(object), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetRepositoryCommits(
        [FromQuery] string fullName,
        [FromHeader(Name = "Authorization")] string? authorization)
    {
        if (string.IsNullOrEmpty(authorization))
        {
            return BadRequest(new { error = "Authorization header with GitHub token is required" });
        }

        if (string.IsNullOrEmpty(fullName) || !fullName.Contains('/'))
        {
            return BadRequest(new { error = "Invalid repository fullName format. Expected format: 'owner/repo'" });
        }

        try
        {
            CommitsDto commits = await _gitHubService.GetRepositoryCommitsByFullNameAsync(authorization, fullName);
            return Ok(new 
            { 
                repository = fullName,
                count = commits.count, 
                commits = commits.commits
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Octokit.AuthorizationException)
        {
            return Unauthorized(new { error = "Invalid GitHub token" });
        }
        catch (Octokit.NotFoundException)
        {
            return NotFound(new { error = $"Repository '{fullName}' not found" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching commits for {FullName}", fullName);
            return StatusCode(500, new { error = "An error occurred while fetching commits" });
        }
    }

    /// <summary>
    /// Get collaborators for a specific repository using fullName and timeRange as part of the route.
    /// </summary>
    /// <param name="authorization">GitHub Personal Access Token</param>
    /// <param name="fullName">Repository full name in format: owner/repo (e.g., 'acavieira/ADS-Grupo_PosLaboral-A')</param>
    /// <param name="timeRange">Time range for filtering statistics ('1 week', '1 month', '3 months').</param>
    /// <returns>List of collaborators for the repository with their respective statistics.</returns>
    [Authorize]
    [HttpGet("collaborators/{fullName}/{timeRange}")]
    [ProducesResponseType(typeof(CollaboratorsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetRepositoryCollaborators(
        [FromRoute] string fullName,
        [FromRoute] string timeRange)
    {
        try
        {
            var accessToken = await HttpContext.GetTokenAsync("access_token");

            if (string.IsNullOrEmpty(accessToken))
            {
                // user is not authenticated via GitHub or token not saved
                return Unauthorized(new { error = "GitHub access token not found. Please login via GitHub first." });
            }

            var decodedFullName = Uri.UnescapeDataString(fullName);
            // Register Log
            var identity = HttpContext.User.Identity as System.Security.Claims.ClaimsIdentity;
            var username = identity?.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
            int? userId = null;
            if (!string.IsNullOrEmpty(username))
            {
                var user = await _dbContext.Users.SingleOrDefaultAsync(u => u.Username == username);

                if (user != null)
                    userId = user.Id;
            }
            if (userId != null)
            {
                _dbContext.Logs.Add(new Models.Log
                {
                    UserId = userId.Value,
                    VisitedEndpoint = HttpContext.Request.Path,
                    Created = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)
                });
                await _dbContext.SaveChangesAsync();
            }
            CollaboratorsDto collaborators = await _gitHubService.GetRepositoryCollaboratorsAsync(accessToken, decodedFullName, timeRange);
            
            return Ok(new 
            {
                repository = decodedFullName,
                count = collaborators.count,
                collaborators = collaborators.collaborators
            });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("Bad request when querying collaborators: {Message}", ex.Message);
            return BadRequest(new { error = ex.Message });
        }
        catch (Octokit.AuthorizationException)
        {
            return Unauthorized(new { error = "Invalid GitHub token" });
        }
        catch (Octokit.NotFoundException)
        {
            return NotFound(new { error = $"Repository '{fullName}' not found or invalid." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching collaborators for {FullName}", fullName);
            return StatusCode(500, new { error = "An error occurred while fetching collaborators." });
        }
    }

    /// <summary>
    /// Get all the view with general repository statistics.
    /// </summary>
    /// <param name="fullName">Repository full name in format: owner/repo (e.g., 'acavieira/ADS-Grupo_PosLaboral-A')</param>
    /// <param name="timeRange">Time range for filtering statistics ('1 week', '1 month', '3 months').</param>
    /// <returns>All the view with general repository statistics.</returns>   
    [Authorize]
    [HttpGet("stats/{fullName}/{timeRange}")]
    [ProducesResponseType(typeof(CollaboratorsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetRepoOverviewStats(
        [FromRoute] string fullName,
        [FromRoute] string timeRange)
    {
        try
        {
            var accessToken = await HttpContext.GetTokenAsync("access_token");

            if (string.IsNullOrEmpty(accessToken))
            {
                // user is not authenticated via GitHub or token not saved
                return Unauthorized(new { error = "GitHub access token not found. Please login via GitHub first." });
            }

            var decodedFullName = Uri.UnescapeDataString(fullName);
        
            // 1. Identify the User
            var identity = HttpContext.User.Identity as System.Security.Claims.ClaimsIdentity;
            var username = identity?.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
            int? userId = null;

            if (!string.IsNullOrEmpty(username))
            {
                //var user = await _dbContext.Users.SingleOrDefaultAsync(u => u.Username == username);
                var user = _dbService.GetUserbyUsername(username);
                if (user.Result != null)
                    userId = user.Result.Id;
            }

            // 2. Perform Database Operations (Log + Repository Upsert)
            if (userId != null)
            {
                // A. Add Log
                _dbService.InsertNewLog(userId.Value, HttpContext.Request.Path);

                // B. Upsert Repository
                _dbService.UpsertVisitedRepository(decodedFullName, userId.Value);

                // Save both the Log and the Repository changes in one transaction
                await _dbContext.SaveChangesAsync();
            }
            
            //CollaboratorsDto collaborators = await _gitHubService.GetRepositoryCollaboratorsAsync(authorization, decodedFullName, timeRange);
            
            RepoOverviewStatsDto statsOverview = await _gitHubService.GetRepositoryStatsAsync(accessToken, decodedFullName, timeRange);
            
            return Ok(statsOverview);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("Bad request when querying statistics: {Message}", ex.Message);
            return BadRequest(new { error = ex.Message });
        }
        catch (Octokit.AuthorizationException)
        {
            return Unauthorized(new { error = "Invalid GitHub token" });
        }
        catch (Octokit.NotFoundException)
        {
            return NotFound(new { error = $"Repository '{fullName}' not found or invalid." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching statistics for {FullName}", fullName);
            return StatusCode(500, new { error = "An error occurred while fetching statistics." });
        }
    }
}