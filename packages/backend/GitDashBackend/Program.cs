using GitDashBackend.Configurations;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
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

// OpenAPI
builder.Services.AddOpenApi();

// Add Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "GitDash Backend API",
        Version = "v1",
        Description = "API for GitDash - GitHub Dashboard",
        Contact = new Microsoft.OpenApi.Models.OpenApiContact
        {
            Name = "GitDash Team - ADS-Grupo_PosLaboral-A",
            Url = new Uri("https://github.com/acavieira/ADS-Grupo_PosLaboral-A")
        }
    });

    // Add GitHub Token Authentication (simple ApiKey)
    options.AddSecurityDefinition("GitHubToken", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "GitHub Personal Access Token. Just paste your token directly (e.g., 'ghp_yourTokenHere')",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "ApiKey"
    });

    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "GitHubToken"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Register custom services 
builder.Services.AddProjectServices();

// Add CORS for frontend
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "GitDash Backend API v1");
        options.RoutePrefix = "swagger";
    });
}

app.UseHttpsRedirection();

app.UseCors();

app.UseAuthorization();

app.MapControllers();

app.Run();