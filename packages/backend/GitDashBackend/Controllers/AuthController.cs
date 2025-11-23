using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace GitDashBackend.Controllers;

[ApiController]
public class AuthController : ControllerBase
{

    [HttpGet("login")]
    public IActionResult Login([FromQuery] string? returnUrl = null)
    {
        // After GitHub login, user is redirected here
        var redirectUrl = Url.Action(nameof(Callback), "Auth", new { returnUrl })!;
        var properties = new AuthenticationProperties { RedirectUri = redirectUrl };

        // This triggers the GitHub OAuth challenge (redirect to GitHub)
        return Challenge(properties, "GitHub");
    }

    // This is NOT the GitHub technical callback path; that is /signin-github handled by middleware.
    // Here we land AFTER the cookie is set, and can read the token.
    [Authorize]
    [HttpGet("callback")]
    public async Task<IActionResult> Callback([FromQuery] string? returnUrl = null)
    {
        // add any logic you need to do with token here
        var accessToken = await HttpContext.GetTokenAsync("access_token");


        // redirect back to FE
        var finalUrl = returnUrl ?? "http://localhost:5173/dashboard";
        return Redirect(finalUrl);
    }

}
