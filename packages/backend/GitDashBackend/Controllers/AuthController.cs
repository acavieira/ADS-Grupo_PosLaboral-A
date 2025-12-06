using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using GitDashBackend.Data;
using GitDashBackend.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.Extensions.Configuration;

namespace GitDashBackend.Controllers;

[ApiController]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

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

        // Get authenticated user info from Claims
        var identity = HttpContext.User.Identity as ClaimsIdentity;
        var githubLogin = identity?.FindFirst(ClaimTypes.Name)?.Value;
        if (string.IsNullOrEmpty(githubLogin))
        {
            return Unauthorized("GitHub login not found in claims.");
        }

        // Try to find existing user
        var user = await _context.Users.SingleOrDefaultAsync(u => u.Username == githubLogin);
        if (user == null)
        {
            // Create new user
            user = new User
            {
                Username = githubLogin,
                Created = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)
            };
            _context.Users.Add(user);
        }
        else
        {
            // Update login date if needed
            user.Created = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
            _context.Users.Update(user);
        }
        await _context.SaveChangesAsync();

        // Gets frontend url from env var
        var frontendUrl = _configuration["FrontendOrigin"]
                     ?? "http://localhost:5173";

        // Redirect back to frontend
        var finalUrl = returnUrl ?? frontendUrl + "/dashboard";
        return Redirect(finalUrl);
    }
}
