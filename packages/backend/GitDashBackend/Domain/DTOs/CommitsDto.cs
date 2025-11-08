namespace GitDashBackend.Domain.DTOs;

public class CommitsDto
{
    public int count { get; set; } 
    public List<CommitDto> commits { get; set; } = new(); 
}

