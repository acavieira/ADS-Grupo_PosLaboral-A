using FakeItEasy;
using GitDashBackend.Controllers;
using GitDashBackend.Domain.DTOs;
using GitDashBackend.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;
using Xunit;

namespace GitDashBackend.Tests.Controllers
{
    public class GitHubControllerTests
    {
        private readonly IGitHubService _gitHubService;
        private readonly ILogger<GitHubController> _logger;
        private readonly GitHubController _controller;

        public GitHubControllerTests()
        {
            _gitHubService = A.Fake<IGitHubService>();
            _logger = A.Fake<ILogger<GitHubController>>();
            _controller = new GitHubController(_gitHubService, _logger);
        }

    // -------------------------------
        // GetRepositories Tests
        // -------------------------------

        [Fact]
        public async Task GetRepositories_ShouldReturnBadRequest_WhenTokenMissing()
        {
            // Act
            var result = await _controller.GetRepositories(null);

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
            GitHubController controller_ = new GitHubController(_gitHubService, _logger);
            var okObjectResult = await controller_.GetRepositories("token") as OkObjectResult;

            // Assert
            Assert.NotNull(okObjectResult);

            Assert.IsType<OkObjectResult>(okObjectResult);

            var repositories = (RepositoriesDto)okObjectResult.Value;
          
            Assert.Equal(2, repositories.count);

        }

        [Fact]
        public async Task GetRepositories_ShouldReturnInternalServerError_WhenUnhandledException()
        {
            // Arrange
            A.CallTo(() => _gitHubService.GetUserRepositoriesAsync("token"))
                .ThrowsAsync(new Exception("Unexpected"));

            // Act
            var result = await _controller.GetRepositories("token");

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
            var result = await _controller.GetRepositoryCollaborators("", "owner/repo", "1 week");

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
            var result = await _controller.GetRepositoryCollaborators("token", "owner/repo", "1 week");

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
            var result = await _controller.GetRepositoryCollaborators("token", "owner/repo", "1 week");

            // Assert
            var error = Assert.IsType<ObjectResult>(result);
            Assert.Equal(StatusCodes.Status500InternalServerError, error.StatusCode);
        }
    }
}