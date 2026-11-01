using System.Text.Json.Serialization;

namespace GitDashBackend.Domain.DTOs;

public class PseudonymizedCollaboratorDto
{
    public string Alias { get; set; } = string.Empty;

    /// <summary>
    /// Opaque reference used to open this person's individual view. It is encrypted, so it never
    /// shows the login, and it changes with every request.
    /// </summary>
    public string Reference { get; set; } = string.Empty;

    /// <summary>
    /// True for the row of the repository owner, so the controller can label the repository without
    /// its login. Never serialized: the response does not say which row is the owner.
    /// </summary>
    [JsonIgnore]
    public bool IsOwner { get; set; }
    public string Role { get; set; } = "read";
    public int Commits { get; set; }
    public int PullRequests { get; set; }
    public int Issues { get; set; }
}