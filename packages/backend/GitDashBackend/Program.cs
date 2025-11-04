using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OAuth;
using Microsoft.OpenApi.Models;
using GitDashBackend.Configurations;

var builder = WebApplication.CreateBuilder(args);

// =====================================
// SERVICES CONFIGURATION
// =====================================

// Add Controllers
builder.Services.AddControllers();

// Configure Redis Cache
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration["Redis:Configuration"];
    options.InstanceName = builder.Configuration["Redis:InstanceName"];
});

// Configure GitHub Settings
builder.Services.Configure<GitHubSettings>(
    builder.Configuration.GetSection("GitHub"));

// Add OpenAPI / Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "GitDash Backend API",
        Version = "v1",
        Description = "API for GitDash - GitHub Dashboard with Redis Caching",
        Contact = new OpenApiContact
        {
            Name = "GitDash Team",
            Url = new Uri("https://github.com/acavieira/ADS-Grupo_PosLaboral-A")
        }
    });

    // Add JWT Authentication to Swagger
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "GitHub Personal Access Token. Example: 'ghp_yourTokenHere'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Register custom services
builder.Services.AddProjectServices();

// =====================================
// AUTHENTICATION - GitHub OAuth
// =====================================
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultSignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = "GitHub";
})
.AddCookie(options =>
{
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.None;
    //options.Cookie.SameSite = SameSiteMode.Strict;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
})
.AddOAuth("GitHub", options =>
{
    options.ClientId = builder.Configuration["GitHub:ClientId"];
    options.ClientSecret = builder.Configuration["GitHub:ClientSecret"];
    options.CallbackPath = new PathString("/signin-github");

    options.AuthorizationEndpoint = "https://github.com/login/oauth/authorize";
    options.TokenEndpoint = "https://github.com/login/oauth/access_token";
    options.UserInformationEndpoint = "https://api.github.com/user";

    options.SaveTokens = true;

    options.ClaimActions.MapJsonKey(System.Security.Claims.ClaimTypes.NameIdentifier, "id");
    options.ClaimActions.MapJsonKey(System.Security.Claims.ClaimTypes.Name, "login");
    options.ClaimActions.MapJsonKey(System.Security.Claims.ClaimTypes.Email, "email");

    options.Events = new OAuthEvents
    {
        OnCreatingTicket = async context =>
        {
            var request = new HttpRequestMessage(HttpMethod.Get, context.Options.UserInformationEndpoint);
            request.Headers.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", context.AccessToken);

            var response = await context.Backchannel.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var user = System.Text.Json.JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            context.RunClaimActions(user.RootElement);
        }
    };
});

// =====================================
// CORS for frontend
// =====================================
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// =====================================
// BUILD APP
// =====================================
var app = builder.Build();

// =====================================
// PIPELINE CONFIGURATION
// =====================================
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "GitDash Backend API v1");
        options.RoutePrefix = "swagger";
    });
}

app.UseHttpsRedirection();
app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// =====================================
// AUTH ROUTES
// =====================================

// Login route inicia OAuth
app.MapGet("/login", async context =>
{
    await context.ChallengeAsync("GitHub", new AuthenticationProperties
    {
        RedirectUri = "/auth/success"
    });
});

// Callback do OAuth
app.MapGet("/auth/success", async context =>
{
    if (context.User.Identity?.IsAuthenticated ?? false)
    {
        // Redireciona para frontend dashboard (sem token na URL)
        context.Response.Redirect("http://localhost:5173/dashboard");
    }
    else
    {
        context.Response.Redirect("/login");
    }
});

// Logout
app.MapGet("/logout", async context =>
{
    await context.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
    context.Response.Redirect("http://localhost:5173");
});

// API para frontend buscar info do user
app.MapGet("/api/user", async context =>
{
    if (context.User.Identity?.IsAuthenticated ?? false)
    {
        var userName = context.User.Identity.Name ?? "";
        await context.Response.WriteAsJsonAsync(new { userName });
    }
    else
    {
        context.Response.StatusCode = 401;
    }
});

app.Run();

// =====================================
// SUPPORT CLASS
// =====================================
public class GitHubSettings
{
    public string? ClientId { get; set; }
    public string? ClientSecret { get; set; }
}
