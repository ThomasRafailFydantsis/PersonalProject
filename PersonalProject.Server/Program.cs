using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using PersonalProject.Server.Data;
using PersonalProject.Server.Models;
using System.Text;
using Microsoft.AspNetCore.Identity;
using PersonalProject.Server.Filters;
using Microsoft.OpenApi.Models;
using Microsoft.Extensions.FileProviders;

internal class Program
{
    private static async Task Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.Services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(builder.Configuration.GetConnectionString("FinalProject")));

        builder.Services.AddScoped<CustomJsonSerializationFilter>();

        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowSpecificOrigins", policy =>
            {
                policy.WithOrigins("https://localhost:52384")
                      .AllowCredentials()
                      .AllowAnyMethod()
                      .AllowAnyHeader();
            });
        });

        builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddDefaultTokenProviders();

        builder.Services.ConfigureApplicationCookie(options =>
        {
            options.Cookie.Name = "MyAppAuthCookie";
            options.LoginPath = "/Account/Login";
            options.LogoutPath = "/Account/Logout";
            options.AccessDeniedPath = "/Account/AccessDenied";
            options.SlidingExpiration = true;
            options.ExpireTimeSpan = TimeSpan.FromMinutes(30);
        });

        var key = Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]);
        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = builder.Configuration["Jwt:Issuer"],
                    ValidAudience = builder.Configuration["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(key)
                };
            });

        builder.Services.AddScoped<ExamService>();
        builder.Services.AddAuthorization();

        builder.Services.AddControllers();
        builder.Logging.ClearProviders();
        builder.Logging.AddConsole();

        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen(options =>
        {
         

            options.OperationFilter<FileUploadOperationFilter>();
            options.EnableAnnotations();
        });

        var app = builder.Build();
        var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
        var profilesPath = Path.Combine(uploadsPath, "profiles");
        var certsPath = Path.Combine(uploadsPath, "certs");

        if (!Directory.Exists(profilesPath)) Directory.CreateDirectory(profilesPath);
        if (!Directory.Exists(certsPath)) Directory.CreateDirectory(certsPath);

        Console.WriteLine($"Uploads directory initialized at: {uploadsPath}");

        if (app.Environment.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
            app.UseSwagger();
            app.UseSwaggerUI();
        }
        app.UseAuthentication();
        app.UseAuthorization();

        using (var scope = app.Services.CreateScope())
        {
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

            if (!await roleManager.RoleExistsAsync("Admin"))
                await roleManager.CreateAsync(new IdentityRole("Admin"));

            if (!await roleManager.RoleExistsAsync("Marker"))
                await roleManager.CreateAsync(new IdentityRole("Marker"));

            if (!await roleManager.RoleExistsAsync("User"))
                await roleManager.CreateAsync(new IdentityRole("User"));

            var adminUser = await userManager.FindByEmailAsync("admin@example.com");
            if (adminUser == null)
            {
                adminUser = new ApplicationUser { UserName = "admin", Email = "admin@example.com", EmailConfirmed = true };
                await userManager.CreateAsync(adminUser, "password1234@ABC");
                await userManager.AddToRoleAsync(adminUser, "Admin");
            }
        }

        app.UseRouting();

        app.UseDeveloperExceptionPage();
        app.UseDefaultFiles();
        app.UseStaticFiles(new StaticFileOptions
        {
            FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), "uploads")),
            RequestPath = "/uploads"
        });
        app.UseSwagger();
        app.UseSwaggerUI();
        app.UseHttpsRedirection();
        app.UseCors("AllowSpecificOrigins");

        app.MapControllers();
        app.MapFallbackToFile("/index.html");

        app.Run();
    }
}