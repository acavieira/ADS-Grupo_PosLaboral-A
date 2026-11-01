using GitDashBackend.Domain.DTOs;

namespace GitDashBackend.Services.Implementations;

public static class CollaboratorPseudonymizer
{
    /// <param name="createReference">Builds the opaque reference for a login; the login itself is never copied to the result.</param>
    /// <param name="ownerLogin">Login of the repository owner; marks that collaborator's row as <c>IsOwner</c> (not serialized).</param>
    public static List<PseudonymizedCollaboratorDto> Apply(
        IEnumerable<CollaboratorDto> collaborators,
        Func<string, string>? createReference = null,
        string? ownerLogin = null)
    {
        // A ordem do GitHub (por exemplo alfabética) não pode revelar quem é cada pseudónimo.
        // Baralha-se primeiro e ordena-se depois pelas métricas; o OrderBy é estável, por isso
        // só os empates ficam em ordem aleatória.
        var baralhados = collaborators.OrderBy(_ => Random.Shared.Next()).ToList();

        return baralhados
            .OrderByDescending(c => c.Commits)
            .ThenByDescending(c => c.PullRequests)
            .ThenByDescending(c => c.Issues)
            .Select((c, i) => new PseudonymizedCollaboratorDto
            {
                Alias = $"Colaborador {i + 1}",
                Reference = createReference?.Invoke(c.Login) ?? string.Empty,
                IsOwner = ownerLogin != null && string.Equals(c.Login, ownerLogin, StringComparison.OrdinalIgnoreCase),
                Role = c.Role,
                Commits = c.Commits,
                PullRequests = c.PullRequests,
                Issues = c.Issues
            })
            .ToList();
    }
}