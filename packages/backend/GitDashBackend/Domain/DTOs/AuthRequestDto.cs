namespace GitDashBackend.Domain.DTOs
{
    public class AuthRequestDto
    {
        public string ClientId { get; set; } = string.Empty;
        public string ClientSecret { get; set; } = string.Empty;
    }
}