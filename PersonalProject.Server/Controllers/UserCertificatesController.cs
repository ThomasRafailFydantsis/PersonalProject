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
                var existingAssociation = await _context.UserCertificates
                    .FirstOrDefaultAsync(uc => uc.UserId == model.UserId && uc.CertId == model.CertId);

                if (existingAssociation != null)
                {
                    return BadRequest("Already associated.");
                }

                var userCertificate = new UserCertificate
                {
                    UserId = model.UserId,
                    CertId = model.CertId,
                    DateAdded = DateTime.Now

                };
                if (string.IsNullOrEmpty(model.UserId) || model.CertId == 0)
                {
                    return BadRequest("Invalid UserId or CertId.");
                }

                _context.UserCertificates.Add(userCertificate);
                await _context.SaveChangesAsync();

                return Ok("Done.");
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