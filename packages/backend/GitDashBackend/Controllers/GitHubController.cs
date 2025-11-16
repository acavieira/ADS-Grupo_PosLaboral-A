using GitDashBackend.Domain.DTOs;
using GitDashBackend.Services.Interfaces;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GitDashBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class GitHubController : ControllerBase
{
    private readonly IGitHubService _gitHubService;
    private readonly ILogger<GitHubController> _logger;

    public GitHubController(IGitHubService gitHubService, ILogger<GitHubController> logger)
    {
        _gitHubService = gitHubService;
        _logger = logger;
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
            // pass token to your service like before
            RepositoriesDto repositories = await _gitHubService.GetUserRepositoriesAsync(accessToken);

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
    [HttpGet("collaborators/{fullName}/{timeRange}")]
    [ProducesResponseType(typeof(CollaboratorsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetRepositoryCollaborators(
        [FromHeader] string authorization,
        [FromRoute] string fullName,
        [FromRoute] string timeRange)
    {
        try
        {
            if (string.IsNullOrEmpty(authorization))
            {
                return Unauthorized("Authorization header is required.");
            }

            var decodedFullName = Uri.UnescapeDataString(fullName);
            CollaboratorsDto collaborators = await _gitHubService.GetRepositoryCollaboratorsAsync(authorization, decodedFullName, timeRange);
            
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
    /// <param name="authorization">GitHub Personal Access Token</param>
    /// <param name="fullName">Repository full name in format: owner/repo (e.g., 'acavieira/ADS-Grupo_PosLaboral-A')</param>
    /// <param name="timeRange">Time range for filtering statistics ('1 week', '1 month', '3 months').</param>
    /// <returns>All the view with general repository statistics.</returns>
    [HttpGet("stats/{fullName}/{timeRange}")]
    [ProducesResponseType(typeof(CollaboratorsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetRepoOverviewStats(
        [FromHeader] string authorization,
        [FromRoute] string fullName,
        [FromRoute] string timeRange)
    {
        try
        {
            if (string.IsNullOrEmpty(authorization))
            {
                return Unauthorized("Authorization header is required.");
            }

            var decodedFullName = Uri.UnescapeDataString(fullName);
            
            //CollaboratorsDto collaborators = await _gitHubService.GetRepositoryCollaboratorsAsync(authorization, decodedFullName, timeRange);
            
            RepoOverviewStatsDto statsOverview = await _gitHubService.GetRepositoryStatsAsync(authorization, decodedFullName, timeRange);
            
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