using System.Security.Cryptography;
using GitDashBackend.Services.Interfaces;
using Microsoft.AspNetCore.DataProtection;

namespace GitDashBackend.Services.Implementations;

public class CollaboratorRefProtector : ICollaboratorRefProtector
{
    // "~" never appears in a GitHub login, so a reference can't be mistaken for one.
    private const string Prefix = "~";
    private static readonly TimeSpan Lifetime = TimeSpan.FromHours(1);

    private readonly ITimeLimitedDataProtector _protector;

    public CollaboratorRefProtector(IDataProtectionProvider provider)
    {
        _protector = provider.CreateProtector("GitDash.CollaboratorReference").ToTimeLimitedDataProtector();
    }

    public bool IsReference(string value) => value.StartsWith(Prefix, StringComparison.Ordinal);

    public string Create(string repository, string login) =>
        Prefix + _protector.Protect($"{repository.ToLowerInvariant()}\n{login}", Lifetime);

    public bool TryResolve(string reference, string repository, out string login)
    {
        login = string.Empty;
        if (!IsReference(reference)) return false;

        try
        {
            var payload = _protector.Unprotect(reference[Prefix.Length..], out _);
            var parts = payload.Split('\n', 2);
            if (parts.Length != 2 || parts[0] != repository.ToLowerInvariant()) return false;

            login = parts[1];
            return true;
        }
        catch (CryptographicException)
        {
            // Malformed, tampered with, expired, or protected with a key we no longer have
            return false;
        }
    }
}
