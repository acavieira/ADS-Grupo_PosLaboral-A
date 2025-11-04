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
    /// <response code="200">Returns the list of repositories</response>
    /// <response code="400">If the Authorization header is missing</response>
    /// <response code="401">If the GitHub token is invalid</response>
    /// <response code="500">If there's an internal server error</response>
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
                count = repositoryDtos.Count(), repositories = repositoryDtos
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