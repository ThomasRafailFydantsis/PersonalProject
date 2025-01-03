using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PersonalProject.Server.Data;
using PersonalProject.Server.Models;
using System.ComponentModel.DataAnnotations;

namespace PersonalProject.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CertificatesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public CertificatesController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddCertificateToUser(AddCertificateDto model)
        {
            try
            {
                if (string.IsNullOrEmpty(model.UserId) || model.CertId == 0)
                {
                    return BadRequest("Invalid UserId or CertId.");
                }

                var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == model.UserId);
                if (user == null)
                {
                    return NotFound("User not found.");
                }

                var cert = await _context.Certs.FirstOrDefaultAsync(c => c.CertId == model.CertId);
                if (cert == null)
                {
                    return NotFound("Certificate not found.");
                }

                var existingAssociation = await _context.UserCertificates
                    .FirstOrDefaultAsync(uc => uc.UserId == model.UserId && uc.CertId == model.CertId);

                if (existingAssociation != null)
                {
                    return BadRequest("Certificate already associated with the user.");
                }

                if (cert.Cost >0)
                {
                    if (user.Coins < cert.Cost)
                    {
                        return BadRequest("Insufficient balance to buy this certificate.");
                    }

                    // Deduct cost
                    user.Coins -= cert.Cost;
                }

                var userCertificate = new UserCertificate
                {
                    UserId = model.UserId,
                    CertId = model.CertId,
                    DateAdded = DateTime.UtcNow
                };

                _context.UserCertificates.Add(userCertificate);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    Message = "Certificate added successfully.",
                    UpdatedBalance = user.Coins
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return StatusCode(500, "An error occurred while adding the certificate.");
            }
        }
        [HttpDelete("remove")]
        public async Task<IActionResult> RemoveCertificateFromUser([FromBody] RemoveCertificateDto model)
        {
            try
            {
                var userCertificate = await _context.UserCertificates
                    .FirstOrDefaultAsync(uc => uc.UserId == model.UserId && uc.CertId == model.CertId);

                if (userCertificate == null)
                {
                    return NotFound(new { message = "Certificate not found for this user." });
                }

                _context.UserCertificates.Remove(userCertificate);
                await _context.SaveChangesAsync();

                return Ok("Certificate removed successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while removing the certificate.");
            }
        }
        [HttpGet("{userId}/achievements")]
        public async Task<IActionResult> GetUserAchievements(string userId)
        {
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest("User ID is required.");
            }

            try
            {
                var userAchievements = await _context.UserAchievements
                                                     .Where(ua => ua.UserId == userId)
                                                     .Select(ua => new
                                                     {
                                                         ua.Id,
                                                         ua.UserId,
                                                         ua.AchievementId,
                                                         AchievementTitle = ua.Achievement.Title,
                                                         AchievementDescription = ua.Achievement.Description,
                                                         AchievementRewardCoins = ua.Achievement.RewardCoins,
                                                         ua.UnlockedOn
                                                     })
                                                     .ToListAsync();

                if (!userAchievements.Any())
                {
                    return NotFound(new { Message = $"No achievements found for user ID {userId}." });
                }

                return Ok(userAchievements);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while fetching user achievements." + ex.Message);
            }
        }

    }
    public class AddCertificateDto
    {
        [Required]
        public string UserId { get; set; }

        [Required]
        public int CertId { get; set; }
    }
    public class RemoveCertificateDto
    {
        [Required]
        public string UserId { get; set; }

        [Required]
        public int CertId { get; set; }
    }   
   
}