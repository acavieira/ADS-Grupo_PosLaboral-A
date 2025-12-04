namespace GitDashBackend.Domain.DTOs;

public class CollaboratorDto
{
    public string Login { get; set; } = string.Empty;
    public string AvatarUrl { get; set; } = string.Empty;
    public string Role { get; set; } = "read"; // it can be 'admin', 'write' ou 'read'
    public int Commits { get; set; }
    public int PullRequests { get; set; }
    public int Issues { get; set; }
}