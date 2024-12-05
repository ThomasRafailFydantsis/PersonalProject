using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
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

        // GET: api/Certs
        //[Authorize]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Certs>>> GetCertsData()
        {
            return await _context.CertsData.ToListAsync();
        }

        // GET: api/Certs/5
        
        [HttpGet("{id}")]
        public async Task<ActionResult<Certs>> GetCerts(int? id)
        {
            var certs = await _context.CertsData.FindAsync(id);

            if (certs == null)
            {
                return NotFound();
            }

            return certs;
        }

        // PUT: api/Certs/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCerts(int? id, Certs certs)
        {
            if (id != certs.CertId)
            {
                return BadRequest();
            }

            _context.Entry(certs).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CertsExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Certs
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
       
        [HttpPost]
        public async Task<ActionResult<Certs>> PostCerts(Certs certs)
        {
            _context.CertsData.Add(certs);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetCerts", new { id = certs.CertId }, certs);
        }

        // DELETE: api/Certs/5
        
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCerts(int? id)
        {
            var certs = await _context.CertsData.FindAsync(id);
            if (certs == null)
            {
                return NotFound();
            }

            _context.CertsData.Remove(certs);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CertsExists(int? id)
        {
            return _context.CertsData.Any(e => e.CertId == id);
        }
    }
}
