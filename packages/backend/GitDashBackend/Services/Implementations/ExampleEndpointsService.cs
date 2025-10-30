namespace GitDashBackend.Services.Implementations
{
    public class ExampleEndpointsService : IExampleEndpointsService
    {
        public string HelloPlanet(string planetName)
        {
            return "Hello " + planetName;
        }
    }
}
