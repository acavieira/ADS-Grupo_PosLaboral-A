namespace GitDashBackend.Services.Interfaces;

/// <summary>
/// Opaque, short-lived reference to a collaborator of a repository.
/// It lets the browser ask for one person's statistics while the pseudonymized list stays free of logins:
/// only the server can turn a reference back into the login, and nothing is stored to do so.
/// </summary>
public interface ICollaboratorRefProtector
{
    /// <summary>True when the value is a reference and not a plain login.</summary>
    bool IsReference(string value);

    /// <summary>Creates a reference to <paramref name="login"/> that is only valid for <paramref name="repository"/>.</summary>
    string Create(string repository, string login);

    /// <summary>Resolves a reference. Fails when it is malformed, tampered with, expired or issued for another repository.</summary>
    bool TryResolve(string reference, string repository, out string login);
}
