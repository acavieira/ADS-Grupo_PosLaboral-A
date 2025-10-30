using GitDashBackend.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GitDashBackend.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class ExampleEndpointsController : ControllerBase
    {

        private readonly ILogger<ExampleEndpointsController> _logger;
        private readonly IExampleEndpointsService _examplesService;

        public ExampleEndpointsController(IExampleEndpointsService examplesService,
            ILogger<ExampleEndpointsController> logger)
        {
            this._examplesService = examplesService;
            _logger = logger; 
        }

        [HttpGet]
        public IActionResult Get()
        {
            return Ok(_examplesService.HelloPlanet("Mars!"));
        }
    }
}
