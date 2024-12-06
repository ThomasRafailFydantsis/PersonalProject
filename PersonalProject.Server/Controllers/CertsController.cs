using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PersonalProject.Server.Data;
using PersonalProject.Server.Models;

namespace PersonalProject.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CertsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CertsController(ApplicationDbContext context)
        {
            _context = context;
        }

        
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CertDto>>> GetCertsData()
        {
            var certs = await _context.Certs.ToListAsync();
            return Ok(certs.Select(c => new CertDto
            {
                CertId = c.CertId,
                CertName = c.CertName,
                Description = c.Description,
                Image = c.Image
            }));
        }

        
        [HttpGet("{userId}/certificates")]
        public async Task<IActionResult> GetUserCertificates(string userId)
        {
            var userCertificates = await _context.UserCertificates
                .Where(uc => uc.UserId == userId)
                .Include(uc => uc.Certificate)
                .ToListAsync();

            if (userCertificates == null || !userCertificates.Any())
            {
                return NotFound(new { message = "No certificates found for the user." });
            }

            return Ok(userCertificates.Select(uc => new
            {
                uc.Certificate.CertId,
                uc.Certificate.CertName,
                uc.Certificate.Description,
                uc.Certificate.Image,
                uc.DateAdded
            }));
        }

        // PUT: api/Certs/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCerts(int id, [FromBody] CertDto certDto)
        {
            if (id != certDto.CertId)
            {
                return BadRequest(new { message = "ID mismatch." });
            }

            var cert = await _context.Certs.FindAsync(id);
            if (cert == null)
            {
                return NotFound(new { message = $"Certificate with ID {id} not found." });
            }

            cert.CertName = certDto.CertName;
            cert.Description = certDto.Description;
            cert.Image = certDto.Image;

            _context.Entry(cert).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CertsExists(id))
                {
                    return NotFound(new { message = "Certificate not found during update." });
                }
                throw;
            }

            return NoContent();
        }

        // POST: api/Certs
        [HttpPost]
        public async Task<ActionResult<CertDto>> PostCerts([FromBody] CertDto certDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var cert = new Certs
            {
                CertName = certDto.CertName,
                Description = certDto.Description,
                Image = certDto.Image
            };

            _context.Certs.Add(cert);
            await _context.SaveChangesAsync();

            certDto.CertId = cert.CertId; // Update DTO with ID from database
            return CreatedAtAction(nameof(GetCertsData), new { id = certDto.CertId }, certDto);
        }

        // DELETE: api/Certs/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCerts(int? id)
        {
            var certs = await _context.Certs.FindAsync(id);
            if (certs == null)
            {
                return NotFound();
            }

            _context.Certs.Remove(certs);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CertsExists(int id)
        {
            return _context.Certs.Any(e => e.CertId == id);
        }
    }

    public class CertDto
    {
        public int CertId { get; set; }
        public string? CertName { get; set; }
        public string? Description { get; set; }
        public string? Image { get; set; }
    }
}