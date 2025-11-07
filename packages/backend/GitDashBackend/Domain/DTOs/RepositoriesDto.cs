namespace GitDashBackend.Domain.DTOs;

public class RepositoriesDto
{
    public int count { get; set; } // Stargazer count
    public List<RepositoryDto> repositories { get; set; } = new(); // List of languages
}