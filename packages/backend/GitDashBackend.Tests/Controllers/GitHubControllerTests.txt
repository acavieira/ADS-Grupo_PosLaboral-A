using FakeItEasy;
using GitDashBackend.Controllers;
using GitDashBackend.Domain.DTOs;
using GitDashBackend.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace GitDashBackend.Tests.Controllers
{
    public class GitHubControllerTests
    {
        private readonly IGitHubService _gitHubService;
        private readonly ILogger<GitHubController> _logger;
        private readonly GitHubController _controller;
        private readonly GitDashBackend.Data.AppDbContext _context;

        public GitHubControllerTests()
        {
            _gitHubService = A.Fake<IGitHubService>();
            _logger = A.Fake<ILogger<GitHubController>>();
                var options = new Microsoft.EntityFrameworkCore.DbContextOptionsBuilder<GitDashBackend.Data.AppDbContext>().Options;
            _context = new GitDashBackend.Data.AppDbContext(options);
            _controller = new GitHubController(_gitHubService, _logger, _context);
        }

    // -------------------------------
        // GetRepositories Tests
        // -------------------------------

        [Fact]
        public async Task GetRepositories_ShouldReturnBadRequest_WhenTokenMissing()
        {
            // Act
            var result = await _controller.GetRepositories();

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal(StatusCodes.Status400BadRequest, badRequest.StatusCode);
        }

        [Fact]
        public async Task GetRepositories_ShouldReturnOk_WhenRepositoriesFound()
        {
            // Arrange
            RepositoriesDto fakeRepos = new();
            fakeRepos.count = 2;
            fakeRepos.repositories.Add(new RepositoryDto());
            fakeRepos.repositories.Add(new RepositoryDto());

            A.CallTo(() => _gitHubService.GetUserRepositoriesAsync("token"))
                .Returns(Task.FromResult<RepositoriesDto>(fakeRepos));

            // Act
            GitHubController controller_ = new GitHubController(_gitHubService, _logger, _context);
            var okObjectResult = await controller_.GetRepositories() as OkObjectResult;

            // Assert
            Assert.NotNull(okObjectResult);
            Assert.IsType<OkObjectResult>(okObjectResult);

            var repositories = okObjectResult.Value as RepositoriesDto;
            Assert.NotNull(repositories);
            Assert.Equal(2, repositories.count);

        }

        [Fact]
        public async Task GetRepositories_ShouldReturnInternalServerError_WhenUnhandledException()
        {
            // Arrange
            A.CallTo(() => _gitHubService.GetUserRepositoriesAsync("token"))
                .ThrowsAsync(new Exception("Unexpected"));

            // Act
            var result = await _controller.GetRepositories();

            // Assert
            var error = Assert.IsType<ObjectResult>(result);
            Assert.Equal(StatusCodes.Status500InternalServerError, error.StatusCode);
        }
        // -------------------------------
        // GetRepositoryCommits Tests
        // -------------------------------

        [Fact]
        public async Task GetRepositoryCommits_ShouldReturnBadRequest_WhenTokenMissing()
        {
            // Act
            var result = await _controller.GetRepositoryCommits("owner/repo", null);

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal(StatusCodes.Status400BadRequest, badRequest.StatusCode);
        }

        [Fact]
        public async Task GetRepositoryCommits_ShouldReturnOk_WhenCommitsFound()
        {
            // Arrange
            CommitsDto fakeCommits = new();
            fakeCommits.commits.Add(new CommitDto());
            fakeCommits.commits.Add(new CommitDto());

            A.CallTo(() => _gitHubService.GetRepositoryCommitsByFullNameAsync("token", "owner/repo"))
                .Returns(Task.FromResult(fakeCommits));

            // Act
            var result = await _controller.GetRepositoryCommits("owner/repo", "token");

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(StatusCodes.Status200OK, okResult.StatusCode);
        }

        [Fact]
        public async Task GetRepositoryCommits_ShouldReturnInternalServerError_WhenUnhandledException()
        {
            // Arrange
            A.CallTo(() => _gitHubService.GetRepositoryCommitsByFullNameAsync("token", "owner/repo"))
                .ThrowsAsync(new Exception("Unexpected"));

            // Act
            var result = await _controller.GetRepositoryCommits("owner/repo", "token");

            // Assert
            var error = Assert.IsType<ObjectResult>(result);
            Assert.Equal(StatusCodes.Status500InternalServerError, error.StatusCode);
        }

        // -------------------------------
        // GetRepositoryCollaborators Tests
        // -------------------------------

        [Fact]
        public async Task GetRepositoryCollaborators_ShouldReturnUnauthorized_WhenTokenMissing()
        {
            // Act
            var result = await _controller.GetRepositoryCollaborators("owner/repo", "1 week");

            // Assert
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal(StatusCodes.Status401Unauthorized, unauthorizedResult.StatusCode);
        }

        [Fact]
        public async Task GetRepositoryCollaborators_ShouldReturnOk_WhenCollaboratorsFound()
        {
            // Arrange
            CollaboratorsDto fakeCollaborators = new();
            fakeCollaborators.collaborators.Add(new CollaboratorDto());
            fakeCollaborators.collaborators.Add(new CollaboratorDto());

            A.CallTo(() => _gitHubService.GetRepositoryCollaboratorsAsync("token", "owner/repo", "1 week"))
                .Returns(Task.FromResult(fakeCollaborators));

            // Act
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization"] = "token";
            _controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
            var result = await _controller.GetRepositoryCollaborators("owner/repo", "1 week");

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(StatusCodes.Status200OK, okResult.StatusCode);
        }

        [Fact]
        public async Task GetRepositoryCollaborators_ShouldReturnInternalServerError_WhenUnhandledException()
        {
            // Arrange
            A.CallTo(() => _gitHubService.GetRepositoryCollaboratorsAsync("token", "owner/repo", "1 week"))
                .ThrowsAsync(new Exception("Unexpected"));

            // Act
            var result = await _controller.GetRepositoryCollaborators("owner/repo", "1 week");

            // Assert
            var error = Assert.IsType<ObjectResult>(result);
            Assert.Equal(StatusCodes.Status500InternalServerError, error.StatusCode);
        }
        
        // -------------------------------
        // GetRepoOverviewStats Tests
        // -------------------------------

        [Fact]
        public async Task GetRepoOverviewStats_ShouldReturnUnauthorized_WhenTokenMissing()
        {
            // Arrange
            // No arrangement needed, token is passed directly

            // Act
            var result = await _controller.GetRepoOverviewStats("owner/repo", "1 week");

            // Assert
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal(StatusCodes.Status401Unauthorized, unauthorizedResult.StatusCode);
            // You could also assert the message:
            // Assert.Equal("Authorization header is required.", (unauthorizedResult.Value as dynamic).error);
        }

        [Fact]
        public async Task GetRepoOverviewStats_ShouldReturnOk_WhenStatsFound()
        {
            // Arrange
            var fakeStats = new RepoOverviewStatsDto(); // Assuming this is your DTO class
            const string token = "valid-token";
            const string fullName = "owner/repo";
            const string timeRange = "1 week";

            A.CallTo(() => _gitHubService.GetRepositoryStatsAsync(token, fullName, timeRange))
                .Returns(Task.FromResult(fakeStats));

            // Act
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization"] = token;
            var controller = new GitHubController(_gitHubService, _logger, _context);
            controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
            var result = await controller.GetRepoOverviewStats(fullName, timeRange);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(StatusCodes.Status200OK, okResult.StatusCode);
            Assert.Same(fakeStats, okResult.Value); // Verify the returned object is the one from the service
        }

        [Fact]
        public async Task GetRepoOverviewStats_ShouldReturnBadRequest_WhenArgumentException()
        {
            // Arrange
            const string token = "valid-token";
            const string fullName = "owner/repo";
            const string timeRange = "1 week";
            const string errorMessage = "Bad argument";

            A.CallTo(() => _gitHubService.GetRepositoryStatsAsync(token, fullName, timeRange))
                .ThrowsAsync(new ArgumentException(errorMessage));

            // Act
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization"] = token;
            var controller = new GitHubController(_gitHubService, _logger, _context);
            controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
            var result = await controller.GetRepoOverviewStats(fullName, timeRange);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal(StatusCodes.Status400BadRequest, badRequestResult.StatusCode);
            // You can assert the error message from the exception is passed through
            // Assert.Equal(errorMessage, (badRequestResult.Value as dynamic).error);
        }

        [Fact]
        public async Task GetRepoOverviewStats_ShouldReturnUnauthorized_WhenTokenInvalid()
        {
            // Arrange
            const string token = "invalid-token";
            const string fullName = "owner/repo";
            const string timeRange = "1 week";

            A.CallTo(() => _gitHubService.GetRepositoryStatsAsync(token, fullName, timeRange))
                .ThrowsAsync(new Octokit.AuthorizationException());

            // Act
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization"] = token;
            _controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
            var result = await _controller.GetRepoOverviewStats(fullName, timeRange);

            // Assert
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal(StatusCodes.Status401Unauthorized, unauthorizedResult.StatusCode);
            // Assert.Equal("Invalid GitHub token", (unauthorizedResult.Value as dynamic).error);
        }

        [Fact]
        public async Task GetRepoOverviewStats_ShouldReturnInternalServerError_WhenUnhandledException()
        {
            // Arrange
            const string token = "valid-token";
            const string fullName = "owner/repo";
            const string timeRange = "1 week";

            A.CallTo(() => _gitHubService.GetRepositoryStatsAsync(token, fullName, timeRange))
                .ThrowsAsync(new Exception("Unexpected error"));

            // Act
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization"] = token;
            _controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
            var result = await _controller.GetRepoOverviewStats(fullName, timeRange);

            // Assert
            var errorResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(StatusCodes.Status500InternalServerError, errorResult.StatusCode);
            // Assert.Equal("An error occurred while fetching statistics.", (errorResult.Value as dynamic).error);
        }

        [Fact]
        public async Task GetRepoOverviewStats_ShouldDecodeFullName_WhenCalled()
        {
            // Arrange
            var fakeStats = new RepoOverviewStatsDto();
            const string token = "valid-token";
            const string encodedName = "owner%2Frepo"; // URL-encoded "owner/repo"
            const string decodedName = "owner/repo";   // The expected decoded string
            const string timeRange = "1 week";

            // IMPORTANT: Configure the mock to expect the *decoded* name
            A.CallTo(() => _gitHubService.GetRepositoryStatsAsync(token, decodedName, timeRange))
                .Returns(Task.FromResult(fakeStats));

            // Act
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization"] = token;
            var controller = new GitHubController(_gitHubService, _logger, _context);
            controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
            var result = await controller.GetRepoOverviewStats(encodedName, timeRange);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(StatusCodes.Status200OK, okResult.StatusCode);

            // Verify the service was called with the correctly decoded name
            A.CallTo(() => _gitHubService.GetRepositoryStatsAsync(token, decodedName, timeRange))
                .MustHaveHappenedOnceExactly();
        }

        // -------------------------------
        // GetCollaboratorWeeklyActivity Tests
        // -------------------------------

        [Fact]
        public async Task GetCollaboratorWeeklyActivity_ShouldReturnUnauthorized_WhenTokenMissing()
        {
            // Arrange
            var controller = new GitHubController(_gitHubService, _logger, _context);
            controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() };
            // Act
            var result = await controller.GetCollaboratorWeeklyActivity("owner/repo", "user");
            // Assert
            var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal(StatusCodes.Status401Unauthorized, unauthorized.StatusCode);
        }

        [Fact]
        public async Task GetCollaboratorWeeklyActivity_ShouldReturnNotFound_WhenCollaboratorOrRepoInvalid()
        {
            // Arrange
            var fakeToken = "token";
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization"] = fakeToken;
            var controller = new GitHubController(_gitHubService, _logger, _context);
            controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
            A.CallTo(() => _gitHubService.GetCollaboratorWeeklyActivityAsync(A<string>._, A<string>._, A<string>._)).Returns(Task.FromResult<WeeklyActivityDto?>(null));
            // Act
            var result = await controller.GetCollaboratorWeeklyActivity("owner/repo", "user");
            // Assert
            var notFound = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal(StatusCodes.Status404NotFound, notFound.StatusCode);
        }

        [Fact]
        public async Task GetCollaboratorWeeklyActivity_ShouldReturnOk_WhenWeeklyActivityFound()
        {
            // Arrange
            var fakeToken = "token";
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization"] = fakeToken;
            var controller = new GitHubController(_gitHubService, _logger, _context);
            controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
            var weeklyActivity = new WeeklyActivityDto { Weeks = new List<int> { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 } };
            A.CallTo(() => _gitHubService.GetCollaboratorWeeklyActivityAsync(A<string>._, A<string>._, A<string>._)).Returns(Task.FromResult<WeeklyActivityDto?>(weeklyActivity));
            // Act
            var result = await controller.GetCollaboratorWeeklyActivity("owner/repo", "user");
            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returned = Assert.IsType<WeeklyActivityDto>(okResult.Value);
            Assert.Equal(12, returned.Weeks.Count);
        }

        // -------------------------------
        // GetCollaboratorActivity Tests
        // -------------------------------

        [Fact]
        public async Task GetCollaboratorActivity_ShouldReturnOk_WhenStatsFound()
        {
            // Arrange
            var fakeToken = "token";
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization"] = fakeToken;
            var controller = new GitHubController(_gitHubService, _logger, _context);
            controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
            var activity = new CollaboratorActivityDto
            {
                commits = new CommitStats { totalCount = 5 },
                pullRequests = new PullRequestStats { totalCount = 2, mergedCount = 1 },
                issues = new IssueStats { totalCount = 3, closedCount = 2 },
                reviews = new ReviewStats { givenCount = 4 }
            };
            _ = A.CallTo(() => _gitHubService.GetCollaboratorActivityAsync(fakeToken, "owner/repo", "user", "1 week"))
                .Returns(Task.FromResult(activity));
            // Act
            var result = await controller.GetCollaboratorActivity("owner/repo", "user", "1 week");
            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returned = Assert.IsType<CollaboratorActivityDto>(okResult.Value);
            Assert.Equal(5, returned.commits.totalCount);
            Assert.Equal(2, returned.pullRequests.totalCount);
            Assert.Equal(1, returned.pullRequests.mergedCount);
            Assert.Equal(3, returned.issues.totalCount);
            Assert.Equal(2, returned.issues.closedCount);
            Assert.Equal(4, returned.reviews.givenCount);
        }

        [Fact]
        public async Task GetCollaboratorActivity_ShouldReturnUnauthorized_WhenTokenMissing()
        {
            // Arrange
            var controller = new GitHubController(_gitHubService, _logger, _context);
            controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() };
            // Act
            var result = await controller.GetCollaboratorActivity("owner/repo", "user", "1 week");
            // Assert
            var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal(StatusCodes.Status401Unauthorized, unauthorized.StatusCode);
        }

        [Fact]
        public async Task GetCollaboratorActivity_ShouldReturnBadRequest_WhenArgumentException()
        {
            // Arrange
            var fakeToken = "token";
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization"] = fakeToken;
            var controller = new GitHubController(_gitHubService, _logger, _context);
            controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
            A.CallTo(() => _gitHubService.GetCollaboratorActivityAsync(fakeToken, "owner/repo", "user", "invalid"))
                .ThrowsAsync(new ArgumentException("Invalid range"));
            // Act
            var result = await controller.GetCollaboratorActivity("owner/repo", "user", "invalid");
            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal(StatusCodes.Status400BadRequest, badRequest.StatusCode);
        }

        [Fact]
        public async Task GetCollaboratorActivity_ShouldReturnInternalServerError_WhenUnhandledException()
        {
            // Arrange
            var fakeToken = "token";
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization"] = fakeToken;
            var controller = new GitHubController(_gitHubService, _logger, _context);
            controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
            A.CallTo(() => _gitHubService.GetCollaboratorActivityAsync(fakeToken, "owner/repo", "user", "1 week"))
                .ThrowsAsync(new Exception("Unexpected error"));
            // Act
            var result = await controller.GetCollaboratorActivity("owner/repo", "user", "1 week");
            // Assert
            var error = Assert.IsType<ObjectResult>(result);
            Assert.Equal(StatusCodes.Status500InternalServerError, error.StatusCode);
        }

        // -------------------------------
        // GetCollaboratorCodeChanges Tests
        // -------------------------------

        [Fact]
        public async Task GetCollaboratorCodeChanges_ShouldReturnOk_WhenDataFound()
        {
            var fakeToken = "token";
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization"] = fakeToken;
            var controller = new GitHubController(_gitHubService, _logger, _context);
            controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
            var codeChanges = new CollaboratorCodeChangesDto { Additions = 10, Deletions = 5 };
            A.CallTo(() => _gitHubService.GetCollaboratorCodeChangesAsync(fakeToken, "owner/repo", "user", "1 week"))
                .Returns(Task.FromResult<CollaboratorCodeChangesDto?>(codeChanges));
            var result = await controller.GetCollaboratorCodeChanges("owner/repo", "user", "1 week");
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returned = Assert.IsType<CollaboratorCodeChangesDto>(okResult.Value);
            Assert.Equal(10, returned.Additions);
            Assert.Equal(5, returned.Deletions);
        }

        [Fact]
        public async Task GetCollaboratorCodeChanges_ShouldReturnNotFound_WhenNoData()
        {
            var fakeToken = "token";
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization"] = fakeToken;
            var controller = new GitHubController(_gitHubService, _logger, _context);
            controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
            A.CallTo(() => _gitHubService.GetCollaboratorCodeChangesAsync(fakeToken, "owner/repo", "user", "1 week"))
                .Returns(Task.FromResult<CollaboratorCodeChangesDto?>(null));
            var result = await controller.GetCollaboratorCodeChanges("owner/repo", "user", "1 week");
            var notFound = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal(StatusCodes.Status404NotFound, notFound.StatusCode);
        }

        [Fact]
        public async Task GetCollaboratorCodeChanges_ShouldReturnUnauthorized_WhenTokenMissing()
        {
            var controller = new GitHubController(_gitHubService, _logger, _context);
            controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() };
            var result = await controller.GetCollaboratorCodeChanges("owner/repo", "user", "1 week");
            var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal(StatusCodes.Status401Unauthorized, unauthorized.StatusCode);
        }

        [Fact]
        public async Task GetCollaboratorCodeChanges_ShouldReturnBadRequest_WhenArgumentException()
        {
            var fakeToken = "token";
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization"] = fakeToken;
            var controller = new GitHubController(_gitHubService, _logger, _context);
            controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
            A.CallTo(() => _gitHubService.GetCollaboratorCodeChangesAsync(fakeToken, "owner/repo", "user", "invalid"))
                .ThrowsAsync(new ArgumentException("Invalid range"));
            var result = await controller.GetCollaboratorCodeChanges("owner/repo", "user", "invalid");
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal(StatusCodes.Status400BadRequest, badRequest.StatusCode);
        }

        [Fact]
        public async Task GetCollaboratorCodeChanges_ShouldReturnInternalServerError_WhenUnhandledException()
        {
            var fakeToken = "token";
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization"] = fakeToken;
            var controller = new GitHubController(_gitHubService, _logger, _context);
            controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
            A.CallTo(() => _gitHubService.GetCollaboratorCodeChangesAsync(fakeToken, "owner/repo", "user", "1 week"))
                .ThrowsAsync(new Exception("Unexpected error"));
            var result = await controller.GetCollaboratorCodeChanges("owner/repo", "user", "1 week");
            var error = Assert.IsType<ObjectResult>(result);
            Assert.Equal(StatusCodes.Status500InternalServerError, error.StatusCode);
        }

        // -------------------------------
        // GetRepositoryByUrl (Lookup by URL) Tests
        // -------------------------------

        [Fact]
        public async Task GetRepositoryByUrl_ShouldReturnOk_WhenRepoFound()
        {
            var fakeToken = "token";
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization"] = fakeToken;
            var controller = new GitHubController(_gitHubService, _logger, _context);
            controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
            var repoDto = new RepositoryDto { FullName = "owner/repo", Description = "desc" };
            A.CallTo(() => _gitHubService.GetRepositoryByOwnerRepoAsync(fakeToken, "owner/repo"))
                .Returns(Task.FromResult<RepositoryDto?>(repoDto));
            var result = await controller.GetRepositoryByUrl("owner/repo");
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returned = Assert.IsType<RepositoryDto>(okResult.Value);
            Assert.Equal("owner/repo", returned.FullName);
        }

        [Fact]
        public async Task GetRepositoryByUrl_ShouldReturnNotFound_WhenRepoNotFound()
        {
            var fakeToken = "token";
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization"] = fakeToken;
            var controller = new GitHubController(_gitHubService, _logger, _context);
            controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
            A.CallTo(() => _gitHubService.GetRepositoryByOwnerRepoAsync(fakeToken, "owner/repo"))
                .Returns(Task.FromResult<RepositoryDto?>(null));
            var result = await controller.GetRepositoryByUrl("owner/repo");
            var notFound = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal(StatusCodes.Status404NotFound, notFound.StatusCode);
        }

        [Fact]
        public async Task GetRepositoryByUrl_ShouldReturnUnauthorized_WhenTokenMissing()
        {
            var controller = new GitHubController(_gitHubService, _logger, _context);
            controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() };
            var result = await controller.GetRepositoryByUrl("owner/repo");
            var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal(StatusCodes.Status401Unauthorized, unauthorized.StatusCode);
        }

        [Fact]
        public async Task GetRepositoryByUrl_ShouldReturnBadRequest_WhenArgumentException()
        {
            var fakeToken = "token";
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization"] = fakeToken;
            var controller = new GitHubController(_gitHubService, _logger, _context);
            controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
            A.CallTo(() => _gitHubService.GetRepositoryByOwnerRepoAsync(fakeToken, "invalid"))
                .ThrowsAsync(new ArgumentException("Invalid format"));
            var result = await controller.GetRepositoryByUrl("invalid");
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal(StatusCodes.Status400BadRequest, badRequest.StatusCode);
        }

        [Fact]
        public async Task GetRepositoryByUrl_ShouldReturnInternalServerError_WhenUnhandledException()
        {
            var fakeToken = "token";
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization"] = fakeToken;
            var controller = new GitHubController(_gitHubService, _logger, _context);
            controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
            A.CallTo(() => _gitHubService.GetRepositoryByOwnerRepoAsync(fakeToken, "owner/repo"))
                .ThrowsAsync(new Exception("Unexpected error"));
            var result = await controller.GetRepositoryByUrl("owner/repo");
            var error = Assert.IsType<ObjectResult>(result);
            Assert.Equal(StatusCodes.Status500InternalServerError, error.StatusCode);
        }
    }
}