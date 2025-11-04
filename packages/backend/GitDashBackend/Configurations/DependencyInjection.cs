namespace GitDashBackend.Configurations;

using GitDashBackend.Services;
using GitDashBackend.Services.Implementations;

public static class DependencyInjection
{
    public static IServiceCollection AddProjectServices(this IServiceCollection services)
    {
        services.AddScoped<IExampleEndpointsService, ExampleEndpointsService>();
        services.AddScoped<IGitHubService, GitHubService>();
        return services;
    }
}
