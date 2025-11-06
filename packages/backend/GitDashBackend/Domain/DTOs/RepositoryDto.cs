namespace GitDashBackend.Domain.DTOs;

public class RepositoryDto
{
    public string FullName { get; set; } = string.Empty; // all communication based on it
    public string Description { get; set; } = string.Empty;
    public bool IsPrivate { get; set; } // Indicates if the repository is private
    public int Starred { get; set; } // Stargazer count
    public int Forked { get; set; } // Fork count
    public List<string> Languages { get; set; } = new(); // List of languages
}