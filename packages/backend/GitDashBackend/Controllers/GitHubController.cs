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
    /// <param name="authorization">GitHub Personal Access Token</param>
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
    /// Get commits for a specific repository
    /// </summary>
    /// <param name="owner">Repository owner username</param>
    /// <param name="repo">Repository name</param>
    /// <param name="authorization">GitHub Personal Access Token</param>
    /// <returns>List of commits with caching</returns>
    [HttpGet("repositories/{owner}/{repo}/commits")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(object), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(object), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(object), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetRepositoryCommits(
        string owner, 
        string repo, 
        [FromHeader(Name = "Authorization")] string? authorization)
    {
        if (string.IsNullOrEmpty(authorization))
        {
            return BadRequest(new { error = "Authorization header with GitHub token is required" });
        }

        try
        {
            var commits = await _gitHubService.GetRepositoryCommitsAsync(authorization, owner, repo);
            var commitDtos = commits.ToList();
            return Ok(new 
            { 
                repository = $"{owner}/{repo}",
                count = commitDtos.Count, 
                commits = commitDtos
            });
        }
        catch (Octokit.AuthorizationException)
        {
            return Unauthorized(new { error = "Invalid GitHub token" });
        }
        catch (Octokit.NotFoundException)
        {
            return NotFound(new { error = $"Repository {owner}/{repo} not found" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching commits for {Owner}/{Repo}", owner, repo);
            return StatusCode(500, new { error = "An error occurred while fetching commits" });
        }
    }
 
}