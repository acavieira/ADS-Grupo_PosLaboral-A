using System.Security.Claims;
using GitDashBackend.Controllers;
using GitDashBackend.Data;
using GitDashBackend.Services.Interfaces;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Moq;


namespace GitDashBackend.Tests.Controllers
{
    // Simple implementation for the scenario where there is no token (NoResult)
    internal class FakeAuthenticationService : IAuthenticationService
    {
        public Task<AuthenticateResult> AuthenticateAsync(HttpContext context, string? scheme)
        {
            return Task.FromResult(AuthenticateResult.NoResult());
        }

        public Task ChallengeAsync(HttpContext context, string? scheme, AuthenticationProperties? properties)
        {
            return Task.CompletedTask;
        }

        public Task ForbidAsync(HttpContext context, string? scheme, AuthenticationProperties? properties)
        {
            return Task.CompletedTask;
        }

        public Task SignInAsync(HttpContext context, string? scheme, ClaimsPrincipal principal, AuthenticationProperties? properties)
        {
            return Task.CompletedTask;
        }

        public Task SignOutAsync(HttpContext context, string? scheme, AuthenticationProperties? properties)
        {
            return Task.CompletedTask;
        }
    }

    public class GitHubControllerTests
    {
        // Creates an in-memory database context for isolated tests
        private AppDbContext CreateInMemoryContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            return new AppDbContext(options);
        }

        // Helper to create a controller instance with mocks and context
        private GitHubController CreateController(
            AppDbContext context,
            Mock<IGitHubService>? gitHubServiceMock = null,
            Mock<IDbService>? dbServiceMock = null)
        {
            var gitHubService = gitHubServiceMock?.Object ?? Mock.Of<IGitHubService>();
            var dbService = dbServiceMock?.Object ?? Mock.Of<IDbService>();
            var logger = Mock.Of<ILogger<GitHubController>>();

            var controller = new GitHubController(
                gitHubService,
                dbService,
                logger,
                context
            );

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            };

            return controller;
        }

        [Fact]
        public async Task GetRepositoryCommits_ReturnsBadRequest_WhenAuthorizationHeaderMissing()
        {
            using var context = CreateInMemoryContext();
            var controller = CreateController(context);

            // Authorization header is null
            var result = await controller.GetRepositoryCommits("owner/repo", null);

            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal(StatusCodes.Status400BadRequest, badRequest.StatusCode);
        }

        [Fact]
        public async Task GetCollaboratorCodeChanges_ReturnsUnauthorized_WhenNoAccessToken()
        {
            using var context = CreateInMemoryContext();
            var gitHubServiceMock = new Mock<IGitHubService>();
            var controller = CreateController(context, gitHubServiceMock);

            var httpContext = new DefaultHttpContext();

            // ServiceProvider with IAuthenticationService that does not return a token (NoResult)
            var services = new ServiceCollection();
            services.AddSingleton<IAuthenticationService, FakeAuthenticationService>();
            httpContext.RequestServices = services.BuildServiceProvider();

            controller.ControllerContext.HttpContext = httpContext;

            var result = await controller.GetCollaboratorCodeChanges("owner/repo", "ana", "1m");

            var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal(StatusCodes.Status401Unauthorized, unauthorized.StatusCode);
        }

        [Fact]
        public async Task GetRepositoryByUrl_ReturnsBadRequest_ForInvalidUrl()
        {
            using var context = CreateInMemoryContext();
            var gitHubServiceMock = new Mock<IGitHubService>();
            var controller = CreateController(context, gitHubServiceMock);

            var httpContext = new DefaultHttpContext();

            // Aqui queremos passar a validação do token -> configurar AuthenticateAsync para devolver token "access_token"
            var authServiceMock = new Mock<IAuthenticationService>();

            var claimsIdentity = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.Name, "ana")
            }, "Test");

            var principal = new ClaimsPrincipal(claimsIdentity);

            var props = new AuthenticationProperties();
            props.StoreTokens(new[]
            {
                new AuthenticationToken
                {
                    Name = "access_token",
                    Value = "token123"
                }
            });

            var ticket = new AuthenticationTicket(principal, props, "TestScheme");
            var authResult = AuthenticateResult.Success(ticket);

            authServiceMock
                .Setup(a => a.AuthenticateAsync(It.IsAny<HttpContext>(), It.IsAny<string?>()))
                .ReturnsAsync(authResult);

            var services = new ServiceCollection();
            services.AddSingleton<IAuthenticationService>(authServiceMock.Object);
            httpContext.RequestServices = services.BuildServiceProvider();

            controller.ControllerContext.HttpContext = httpContext;

            // URL inválido -> depois de passar o token, deve cair na validação do URL
            var result = await controller.GetRepositoryByUrl("isto-nao-e-url");

            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal(StatusCodes.Status400BadRequest, badRequest.StatusCode);
        }
    }
}
