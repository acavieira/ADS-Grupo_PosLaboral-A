using System;
using System.Threading.Tasks;
using GitDashBackend.Accessors.Interfaces;
using GitDashBackend.Domain.DTOs;
using GitDashBackend.Services.Implementations;
using GitDashBackend.Services.Interfaces;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace GitDashBackend.Tests.Services
{
    public class GitHubServiceTests
    {
        private readonly Mock<IGitHubAccessor> _gitHubAccessorMock;
        private readonly Mock<IRedisAccessor> _redisAccessorMock;
        private readonly GitHubService _service;

        public GitHubServiceTests()
        {
            _gitHubAccessorMock = new Mock<IGitHubAccessor>();
            _redisAccessorMock = new Mock<IRedisAccessor>();
            var logger = Mock.Of<ILogger<GitDashBackend.Services.Implementations.GitHubService>>();

            _service = new GitDashBackend.Services.Implementations.GitHubService(
                _gitHubAccessorMock.Object,
                _redisAccessorMock.Object,
                logger
            );
        }

        [Fact]
        public async Task GetUserRepositoriesAsync_WhenCacheMiss_FetchesFromAccessorAndCaches()
        {
            // Arrange
            var token = "fake-token";
            var expectedDto = new RepositoriesDto
            {
                count = 1,
                repositories = { new RepositoryDto { FullName = "owner/repo" } }
            };

            _redisAccessorMock
                .Setup(r => r.GetAsync<RepositoriesDto>(It.IsAny<string>()))
                .ReturnsAsync((RepositoriesDto?)null); // cache miss

            _gitHubAccessorMock
                .Setup(a => a.GetUserRepositoriesAsync(token))
                .ReturnsAsync(expectedDto);

            // Act
            var result = await _service.GetUserRepositoriesAsync(token);

            // Assert
            Assert.Equal(expectedDto, result);

            _gitHubAccessorMock.Verify(a => a.GetUserRepositoriesAsync(token), Times.Once);
            _redisAccessorMock.Verify(r => r.SetAsync(
                    It.IsAny<string>(),
                    expectedDto,
                    It.IsAny<TimeSpan>()),
                Times.Once);
        }

        [Fact]
        public async Task GetUserRepositoriesAsync_WhenCacheHit_DoesNotCallAccessor()
        {
            // Arrange: Prepare a fake token and a cached DTO with two repositories
            var token = "fake-token";
            var cachedDto = new RepositoriesDto
            {
                count = 2,
                repositories =
                {
                    new RepositoryDto { FullName = "owner/repo1" },
                    new RepositoryDto { FullName = "owner/repo2" }
                }
            };

            _redisAccessorMock
                .Setup(r => r.GetAsync<RepositoriesDto>(It.IsAny<string>()))
                .ReturnsAsync(cachedDto);

            // Act: Call the service method
            var result = await _service.GetUserRepositoriesAsync(token);

            // Assert: Should return cached result and not call GitHubAccessor
            Assert.Equal(2, result.count);
            _gitHubAccessorMock.Verify(a => a.GetUserRepositoriesAsync(It.IsAny<string>()), Times.Never);
        }
    }
}
