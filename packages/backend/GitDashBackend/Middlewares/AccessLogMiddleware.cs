using System.Security.Claims;
using GitDashBackend.Data;
using GitDashBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace GitDashBackend.Middlewares;

public class AccessLogMiddleware
{
    private readonly RequestDelegate _next;

    public AccessLogMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, AppDbContext dbContext)
    {
        // Try to get the authenticated user
        var identity = context.User.Identity as ClaimsIdentity;
        var username = identity?.FindFirst(ClaimTypes.Name)?.Value;
        int? userId = null;

        if (!string.IsNullOrEmpty(username))
        {
            var user = await dbContext.Users.SingleOrDefaultAsync(u => u.Username == username);
            if (user != null)
                userId = user.Id;
        }

        // Register access log
        if (userId != null)
        {
            var log = new Log
            {
                UserId = userId.Value,
                VisitedEndpoint = context.Request.Path,
                Created = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)
            };
            dbContext.Logs.Add(log);
            await dbContext.SaveChangesAsync();
        }

        await _next(context);
    }
}

// Extension to register the middleware
public static class AccessLogMiddlewareExtensions
{
    public static IApplicationBuilder UseAccessLog(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<AccessLogMiddleware>();
    }
}
