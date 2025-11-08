namespace GitDashBackend.Domain.DTOs;

public class CollaboratorsDto
{
    public int count { get; set; } 
    public List<CollaboratorDto> collaborators { get; set; } = new(); 
}