using GitDashBackend.Services;
using Microsoft.AspNetCore.Mvc;

namespace GitDashBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
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
    /// <param name="token">GitHub personal access token</param>
    /// <returns>List of repositories</returns>
    [HttpGet("repositories")]
    public async Task<IActionResult> GetRepositories([FromHeader(Name = "Authorization")] string? authorization)
    {
        if (string.IsNullOrEmpty(authorization))
        {
            return BadRequest(new { error = "Authorization header with GitHub token is required" });
        }

        // Remove "Bearer " prefix if present
        var token = authorization.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase) 
            ? authorization.Substring(7) 
            : authorization;

        try
        {
            var repositories = await _gitHubService.GetUserRepositoriesAsync(token);
            return Ok(new { 
                count = repositories.Count(),
                repositories,
                cached = true // This will be true after first call
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
}