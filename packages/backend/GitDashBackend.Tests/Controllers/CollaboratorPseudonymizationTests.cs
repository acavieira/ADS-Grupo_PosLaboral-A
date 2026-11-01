using System.Security.Claims;
using System.Text.Json;
using GitDashBackend.Controllers;
using GitDashBackend.Data;
using GitDashBackend.Domain.DTOs;
using GitDashBackend.Services.Implementations;
using GitDashBackend.Services.Interfaces;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Moq;

namespace GitDashBackend.Tests.Controllers;

public class CollaboratorPseudonymizationTests
{
    private static readonly string[] Logins = { "ana-silva", "bruno-costa", "carla-reis" };

    private static List<CollaboratorDto> Sample() => new()
    {
        new() { Login = "ana-silva", AvatarUrl = "https://avatars.githubusercontent.com/u/1", Role = "admin", Commits = 12, PullRequests = 4, Issues = 1 },
        new() { Login = "bruno-costa", AvatarUrl = "https://avatars.githubusercontent.com/u/2", Role = "write", Commits = 30, PullRequests = 9, Issues = 3 },
        new() { Login = "carla-reis", AvatarUrl = "https://avatars.githubusercontent.com/u/3", Role = "read", Commits = 0, PullRequests = 0, Issues = 2 }
    };

    private static string ToJson(object? value) =>
        JsonSerializer.Serialize(value, new JsonSerializerOptions(JsonSerializerDefaults.Web));

    [Fact]
    public void Apply_NumbersCollaboratorsFromOneToN_OrderedByActivity()
    {
        var result = CollaboratorPseudonymizer.Apply(Sample());

        Assert.Equal(new[] { "Colaborador 1", "Colaborador 2", "Colaborador 3" }, result.Select(c => c.Alias));
        Assert.Equal(new[] { 30, 12, 0 }, result.Select(c => c.Commits));
    }

    [Fact]
    public void Apply_KeepsMetricsAndRole()
    {
        var result = CollaboratorPseudonymizer.Apply(Sample());

        var top = result[0];
        Assert.Equal("write", top.Role);
        Assert.Equal(30, top.Commits);
        Assert.Equal(9, top.PullRequests);
        Assert.Equal(3, top.Issues);
    }

    [Fact]
    public void Apply_DoesNotKeepLoginsOrAvatars()
    {
        var json = ToJson(CollaboratorPseudonymizer.Apply(Sample()));

        foreach (var login in Logins)
            Assert.DoesNotContain(login, json, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("avatar", json, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("login", json, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void Apply_GivesUniqueAliases_WhenMetricsTie()
    {
        var empatados = Enumerable.Range(1, 5)
            .Select(i => new CollaboratorDto { Login = $"user{i}", Commits = 3, PullRequests = 1, Issues = 0 });

        var result = CollaboratorPseudonymizer.Apply(empatados);

        Assert.Equal(5, result.Select(c => c.Alias).Distinct().Count());
    }

    [Fact]
    public void Apply_ReturnsEmptyList_WhenThereAreNoCollaborators()
    {
        Assert.Empty(CollaboratorPseudonymizer.Apply(new List<CollaboratorDto>()));
    }

    [Fact]
    public async Task GetRepositoryCollaborators_WithPseudonymize_ResponseHasNoLoginsOrAvatars()
    {
        var controller = CreateController(out var service);
        service.Setup(s => s.GetRepositoryCollaboratorsAsync("token-ana", "owner/repo", "1 week"))
            .ReturnsAsync(new CollaboratorsDto { count = 3, collaborators = Sample() });

        var result = await controller.GetRepositoryCollaborators("owner%2Frepo", "1 week", pseudonymize: true);

        var ok = Assert.IsType<OkObjectResult>(result);
        var json = ToJson(ok.Value);
        foreach (var login in Logins)
            Assert.DoesNotContain(login, json, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("avatar", json, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("login", json, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("Colaborador 1", json);
        Assert.Contains("\"pseudonymized\":true", json);
    }

    [Fact]
    public async Task GetRepositoryCollaborators_WithPseudonymize_LabelsThePersonalRepositoryWithTheOwnersAlias()
    {
        var controller = CreateController(out var service);
        service.Setup(s => s.GetRepositoryCollaboratorsAsync("token-ana", "ana-silva/projeto", "1 week"))
            .ReturnsAsync(new CollaboratorsDto { count = 3, collaborators = Sample() });

        var result = await controller.GetRepositoryCollaborators("ana-silva%2Fprojeto", "1 week", pseudonymize: true);

        // ana-silva owns the repository and is the second most active ("Colaborador 2"); her login must not survive
        var json = ToJson(Assert.IsType<OkObjectResult>(result).Value);
        using var document = JsonDocument.Parse(json);
        Assert.Equal("Colaborador 2/projeto", document.RootElement.GetProperty("repository").GetString());
        Assert.DoesNotContain("ana-silva", json, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("isOwner", json, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task GetRepositoryCollaborators_WithPseudonymize_KeepsTheNameWhenTheOwnerIsNotACollaborator()
    {
        var controller = CreateController(out var service);
        service.Setup(s => s.GetRepositoryCollaboratorsAsync("token-ana", "some-org/projeto", "1 week"))
            .ReturnsAsync(new CollaboratorsDto { count = 3, collaborators = Sample() });

        var result = await controller.GetRepositoryCollaborators("some-org%2Fprojeto", "1 week", pseudonymize: true);

        var json = ToJson(Assert.IsType<OkObjectResult>(result).Value);
        using var document = JsonDocument.Parse(json);
        Assert.Equal("some-org/projeto", document.RootElement.GetProperty("repository").GetString());
    }

    [Fact]
    public async Task GetRepositoryCollaborators_WithoutOption_KeepsIdentifiedResponse()
    {
        var controller = CreateController(out var service);
        service.Setup(s => s.GetRepositoryCollaboratorsAsync("token-ana", "owner/repo", "1 week"))
            .ReturnsAsync(new CollaboratorsDto { count = 3, collaborators = Sample() });

        var result = await controller.GetRepositoryCollaborators("owner%2Frepo", "1 week");

        var ok = Assert.IsType<OkObjectResult>(result);
        var json = ToJson(ok.Value);
        foreach (var login in Logins)
            Assert.Contains(login, json);
        Assert.Contains("\"pseudonymized\":false", json);
    }

    [Fact]
    public void Apply_AddsAReferencePerCollaborator_WithoutCopyingTheLogin()
    {
        var result = CollaboratorPseudonymizer.Apply(Sample(), login => $"~for-{Array.IndexOf(Logins, login)}");

        // bruno-costa (index 1) is the most active, so he is "Colaborador 1"
        Assert.Equal("~for-1", result[0].Reference);
        var json = ToJson(result);
        foreach (var login in Logins)
            Assert.DoesNotContain(login, json, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task IndividualViews_AcceptTheReferenceFromThePseudonymizedList()
    {
        var protector = new CollaboratorRefProtector(DataProtectionProvider.Create("tests"));
        var controller = CreateController(out var service, protector);
        service.Setup(s => s.GetRepositoryCollaboratorsAsync("token-ana", "owner/repo", "1 week"))
            .ReturnsAsync(new CollaboratorsDto { count = 3, collaborators = Sample() });
        service.Setup(s => s.GetCollaboratorActivityAsync("token-ana", "owner/repo", "bruno-costa", "1w"))
            .ReturnsAsync(new CollaboratorActivityDto());
        service.Setup(s => s.GetCollaboratorCodeChangesAsync("token-ana", "owner/repo", "bruno-costa", "1w"))
            .ReturnsAsync(new CollaboratorCodeChangesDto());
        service.Setup(s => s.GetCollaboratorWeeklyActivityAsync("token-ana", "owner/repo", "bruno-costa"))
            .ReturnsAsync(new WeeklyActivityDto());

        var list = await controller.GetRepositoryCollaborators("owner%2Frepo", "1 week", pseudonymize: true);

        // The list never shows the login, only an opaque reference ("Colaborador 1" is bruno-costa)
        var json = ToJson(Assert.IsType<OkObjectResult>(list).Value);
        Assert.DoesNotContain("bruno-costa", json, StringComparison.OrdinalIgnoreCase);
        using var document = JsonDocument.Parse(json);
        var top = document.RootElement.GetProperty("collaborators")[0];
        Assert.Equal("Colaborador 1", top.GetProperty("alias").GetString());
        var reference = top.GetProperty("reference").GetString()!;

        Assert.IsType<OkObjectResult>(await controller.GetCollaboratorActivity("owner%2Frepo", reference, "1w"));
        // This endpoint hands fullName to the service as received: the router has already decoded it
        Assert.IsType<OkObjectResult>(await controller.GetCollaboratorCodeChanges("owner/repo", reference, "1w"));
        Assert.IsType<OkObjectResult>(await controller.GetCollaboratorWeeklyActivity("owner%2Frepo", reference));
        service.Verify(s => s.GetCollaboratorActivityAsync("token-ana", "owner/repo", "bruno-costa", "1w"), Times.Once);
        service.Verify(s => s.GetCollaboratorCodeChangesAsync("token-ana", "owner/repo", "bruno-costa", "1w"), Times.Once);
        service.Verify(s => s.GetCollaboratorWeeklyActivityAsync("token-ana", "owner/repo", "bruno-costa"), Times.Once);
    }

    [Fact]
    public async Task IndividualViews_RejectAReferenceThatIsInvalidOrForAnotherRepository()
    {
        var protector = new CollaboratorRefProtector(DataProtectionProvider.Create("tests"));
        var controller = CreateController(out var service, protector);
        var forOtherRepo = protector.Create("owner/other", "bruno-costa");

        Assert.IsType<NotFoundObjectResult>(await controller.GetCollaboratorActivity("owner%2Frepo", forOtherRepo, "1w"));
        Assert.IsType<NotFoundObjectResult>(await controller.GetCollaboratorActivity("owner%2Frepo", "~not-a-valid-reference", "1w"));
        Assert.IsType<NotFoundObjectResult>(await controller.GetCollaboratorCodeChanges("owner%2Frepo", "~not-a-valid-reference", "1w"));
        Assert.IsType<NotFoundObjectResult>(await controller.GetCollaboratorWeeklyActivity("owner%2Frepo", "~not-a-valid-reference"));
        service.Verify(
            s => s.GetCollaboratorActivityAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()),
            Times.Never);
    }

    [Fact]
    public async Task IndividualViews_StillAcceptAPlainLogin()
    {
        var protector = new CollaboratorRefProtector(DataProtectionProvider.Create("tests"));
        var controller = CreateController(out var service, protector);
        service.Setup(s => s.GetCollaboratorActivityAsync("token-ana", "owner/repo", "bruno-costa", "1w"))
            .ReturnsAsync(new CollaboratorActivityDto());

        var result = await controller.GetCollaboratorActivity("owner%2Frepo", "bruno-costa", "1w");

        Assert.IsType<OkObjectResult>(result);
    }

    // Controller com uma sessão autenticada (login "ana" e token "token-ana"), como o middleware de cookies fornece.
    // Por omissão as referências são falsas (fixas); os testes do percurso completo passam o protetor real.
    private static GitHubController CreateController(out Mock<IGitHubService> service, ICollaboratorRefProtector? refs = null)
    {
        if (refs == null)
        {
            var fake = new Mock<ICollaboratorRefProtector>();
            fake.Setup(r => r.Create(It.IsAny<string>(), It.IsAny<string>())).Returns("~fake-reference");
            refs = fake.Object;
        }

        service = new Mock<IGitHubService>();
        var context = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options);

        var principal = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.Name, "ana") }, "Test"));
        var props = new AuthenticationProperties();
        props.StoreTokens(new[] { new AuthenticationToken { Name = "access_token", Value = "token-ana" } });

        var auth = new Mock<IAuthenticationService>();
        auth.Setup(a => a.AuthenticateAsync(It.IsAny<HttpContext>(), It.IsAny<string?>()))
            .ReturnsAsync(AuthenticateResult.Success(new AuthenticationTicket(principal, props, "Test")));

        var services = new ServiceCollection();
        services.AddSingleton(auth.Object);

        return new GitHubController(service.Object, Mock.Of<IDbService>(), Mock.Of<ILogger<GitHubController>>(), context, refs)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = principal, RequestServices = services.BuildServiceProvider() }
            }
        };
    }
}
