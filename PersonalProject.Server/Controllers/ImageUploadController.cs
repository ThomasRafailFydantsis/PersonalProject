using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PersonalProject.Server.Data;
using Swashbuckle.AspNetCore.Annotations;
using PersonalProject.Server.Models;

namespace PersonalProject.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ImageUploadController : ControllerBase // ToDO fix swagger
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public ImageUploadController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {

            this._context = context;
            this._userManager = userManager;
        }
        [HttpPut("upload/exam")]
        [SwaggerOperation(OperationId = "UploadExamImage")]
        public async Task<IActionResult> UploadExamImage([FromForm] IFormFile file, [FromForm] int certId)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest("Invalid file.");

                var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "certs");
                Directory.CreateDirectory(uploadsPath);

                var fileName = $"{certId}_{Path.GetFileName(file.FileName)}";
                var filePath = Path.Combine(uploadsPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var cert = await _context.Certs.FindAsync(certId);
                if (cert == null)
                {
                    return NotFound(new { message = $"Certificate with ID {certId} not found." });
                }

                cert.ImagePath = $"/uploads/certs/{fileName}";
                _context.Entry(cert).State = EntityState.Modified; // Explicitly mark as modified
                await _context.SaveChangesAsync();

                return Ok(new { Path = $"/uploads/certs/{fileName}" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error uploading exam image: {ex.Message}");
                return StatusCode(500, "Internal server error.");
            }
        }
        [HttpPut("upload/user-profile")]
        [SwaggerOperation(OperationId = "UploadUserProfileImage")]
        public async Task<IActionResult> UploadUserProfileImage([FromForm] IFormFile file, [FromForm] string userId)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest("Invalid file.");

                var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "profiles");
                Directory.CreateDirectory(uploadsPath);

                var fileName = $"{userId}_{Path.GetFileName(file.FileName)}";
                var filePath = Path.Combine(uploadsPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return NotFound("User not found.");
                }

                user.ProfileImagePath = $"/uploads/profiles/{fileName}";
                var updateResult = await _userManager.UpdateAsync(user);

                if (!updateResult.Succeeded)
                {
                    var errors = string.Join(", ", updateResult.Errors.Select(e => e.Description));
                    return BadRequest($"Failed to update user profile image. Errors: {errors}");
                }

                return Ok(new { Path = $"/uploads/profiles/{fileName}" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error uploading profile image: {ex.Message}");
                return StatusCode(500, "Internal server error.");
            }
        }
        [HttpGet("get-user-profile-image/{userId}")]
        [SwaggerOperation(OperationId = "GetUserProfileImage")]
        public async Task<IActionResult> GetUserProfileImage(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            var imagePath = user.ProfileImagePath;
            

            return Ok(imagePath);
        }
    }
}
