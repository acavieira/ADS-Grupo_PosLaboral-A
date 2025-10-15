namespace GitDashBackend.Services
{
    public class ExampleEndpointsService : IExampleEndpointsService
    {
        public string HelloPlanet(string planetName)
        {
            return "Hello " + planetName;
        }
    }
}
