using GitDashBackend.Services.Interfaces;
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
    /// Get user repositories from GitHub
    /// </summary>
    /// <param name="authorization">GitHub Personal Access Token (direct token without Bearer prefix)</param>
    /// <returns>List of user repositories with caching</returns>
    [HttpGet("repositories")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(object), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(object), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetRepositories([FromHeader(Name = "Authorization")] string? authorization)
    {
        if (string.IsNullOrEmpty(authorization))
        {
            return BadRequest(new { error = "Authorization header with GitHub token is required" });
        }

        try
        {
            var repositories = await _gitHubService.GetUserRepositoriesAsync(authorization);
            var repositoryDtos = repositories.ToList();
            return Ok(new 
            { 
                count = repositoryDtos.Count, 
                repositories = repositoryDtos
            });
        }
        catch (Octokit.AuthorizationException)
        {
            return Unauthorized(new { error = "Invalid GitHub token" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching repositories");
            return StatusCode(500, new { error = "An error occurred while fetching repositories" });
        }
    }

    /// <summary>
    /// Get commits for a specific repository using fullName as query parameter
    /// </summary>
    /// <param name="fullName">Repository full name in format: owner/repo (e.g., 'acavieira/ADS-Grupo_PosLaboral-A')</param>
    /// <param name="authorization">GitHub Personal Access Token</param>
    /// <returns>List of commits with caching</returns>
    /// <example>GET /api/github/commits?fullName=acavieira/ADS-Grupo_PosLaboral-A</example>
    [HttpGet("commits")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
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
            var commits = await _gitHubService.GetRepositoryCommitsByFullNameAsync(authorization, fullName);
            var commitDtos = commits.ToList();
            return Ok(new 
            { 
                repository = fullName,
                count = commitDtos.Count, 
                commits = commitDtos
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
}