using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PersonalProject.Server.Data;
using PersonalProject.Server.Filters;
using PersonalProject.Server.Models;
using Swashbuckle.AspNetCore.Annotations;

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
                ImagePath = c.ImagePath,
                Description = c.Description,
               
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
                uc.IsPassed,
                uc.DateAdded
            }));
        }
        [HttpGet("{userId}/owned")]
        public async Task<IActionResult> GetOwnedCerts(string userId)
        {
            // Fetch all certificates owned by the user
            var ownedCerts = await _context.UserCertificates
                .Where(uc => uc.UserId == userId && uc.Certificate != null)
                .Include(uc => uc.Certificate)  // Include certificate details
                .ToListAsync();

            if (ownedCerts == null || !ownedCerts.Any())
            {
                return NotFound(new { message = "No owned certificates found for the user." });
            }

            return Ok(ownedCerts.Select(uc => new
            {
                uc.Certificate.CertId,
                uc.Certificate.CertName,
                uc.IsPassed,
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

            cert.Description= certDto.Description;
           

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
                CertName = certDto.CertName
               
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
        [HttpGet("{id}/description")]
        public async Task<ActionResult<CertDto>> GetCertById(int id)
        {
            var cert = await _context.Certs
                .Include(c => c.Descriptions)
                .FirstOrDefaultAsync(c => c.CertId == id);

            if (cert == null)
            {
                return NotFound();
            }

            var certDto = new CertDto1
            {
                CertId = cert.CertId,
                CertName = cert.CertName,
                ImagePath = cert.ImagePath,
                MainDescription = cert.Description,
                Descriptions = cert.Descriptions.Select(d => new DescriptionDto
                {
                    DescriptionId = d.DescriptionId,
                    Text1 = d.Text1,
                    Text2 = d.Text2,
                    Text3 = d.Text3
                }).ToList()
            };

            return Ok(certDto);
        }
        [ServiceFilter(typeof(CustomJsonSerializationFilter))]
        [HttpPut("/description")]
        public async Task<ActionResult<Certs>> UpdateCert([FromBody] CertDto1 certDto1)
        {
            if (certDto1 == null || certDto1.CertId <= 0)
            {
                return BadRequest("Invalid certification data.");
            }

            var cert = await _context.Certs
                .Include(c => c.Descriptions)
                .FirstOrDefaultAsync(c => c.CertId == certDto1.CertId);

            if (cert == null)
            {
                return NotFound($"Certification with ID {certDto1.CertId} not found.");
            }

            // Update the main cert properties
            //cert.CertName = certDto1.CertName;
            //cert.ImagePath = certDto1.ImagePath;
            cert.Description = certDto1.MainDescription;

            // Update the descriptions
            cert.Descriptions.Clear();
            foreach (var descriptionDto in certDto1.Descriptions)
            {
                cert.Descriptions.Add(new Description
                {
                    Text1 = descriptionDto.Text1,
                    Text2 = descriptionDto.Text2,
                    Text3 = descriptionDto.Text3
                });
            }

            _context.Certs.Update(cert);
            await _context.SaveChangesAsync();

            return Ok(cert);
        }
    }

    public class CertDto
    {
        public int CertId { get; set; }
        public string? CertName { get; set; }
        public string? Description { get; set; }
        public string? ImagePath { get; set; }
    }
    public class CertDto1
    {
        public int CertId { get; set; }
        public string? CertName { get; set; }
        public string? ImagePath { get; set; }
        public string? MainDescription { get; set; }
        public List<DescriptionDto> Descriptions { get; set; }
    }
    public class DescriptionDto
    {
        public int DescriptionId { get; set; }
        public string? Text1 { get; set; }
        public string? Text2 { get; set; }
        public string? Text3 { get; set; }
    }
}