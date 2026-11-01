using GitDashBackend.Services.Implementations;
using Microsoft.AspNetCore.DataProtection;

namespace GitDashBackend.Tests.Services;

public class CollaboratorRefProtectorTests
{
    private static CollaboratorRefProtector Create(string purpose = "tests") =>
        new(DataProtectionProvider.Create(purpose));

    [Fact]
    public void TryResolve_ReturnsTheLogin_ForTheSameRepository()
    {
        var protector = Create();

        var reference = protector.Create("Owner/Repo", "bruno-costa");

        Assert.True(protector.TryResolve(reference, "owner/repo", out var login));
        Assert.Equal("bruno-costa", login);
    }

    [Fact]
    public void Create_DoesNotRevealTheLogin_AndDiffersBetweenRequests()
    {
        var protector = Create();

        var first = protector.Create("owner/repo", "bruno-costa");
        var second = protector.Create("owner/repo", "bruno-costa");

        Assert.DoesNotContain("bruno-costa", first, StringComparison.OrdinalIgnoreCase);
        Assert.NotEqual(first, second);
    }

    [Fact]
    public void IsReference_SeparatesReferencesFromLogins()
    {
        var protector = Create();

        Assert.True(protector.IsReference(protector.Create("owner/repo", "ana-silva")));
        Assert.False(protector.IsReference("ana-silva"));
        Assert.False(protector.IsReference("user_acme"));
    }

    [Fact]
    public void TryResolve_Fails_ForAnotherRepository()
    {
        var protector = Create();
        var reference = protector.Create("owner/repo", "bruno-costa");

        Assert.False(protector.TryResolve(reference, "owner/other", out var login));
        Assert.Equal(string.Empty, login);
    }

    [Fact]
    public void TryResolve_Fails_ForTamperedOrMalformedReferences()
    {
        var protector = Create();
        var reference = protector.Create("owner/repo", "bruno-costa");
        var tampered = reference[..^2] + (reference.EndsWith("AA") ? "BB" : "AA");

        Assert.False(protector.TryResolve(tampered, "owner/repo", out _));
        Assert.False(protector.TryResolve("~", "owner/repo", out _));
        Assert.False(protector.TryResolve("~not-a-valid-reference", "owner/repo", out _));
        Assert.False(protector.TryResolve("bruno-costa", "owner/repo", out _));
    }

    [Fact]
    public void TryResolve_Fails_ForAReferenceMadeWithAnotherKey()
    {
        var reference = Create("one-key").Create("owner/repo", "bruno-costa");

        Assert.False(Create("another-key").TryResolve(reference, "owner/repo", out _));
    }
}
