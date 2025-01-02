using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PersonalProject.Server.Data;
using PersonalProject.Server.Models;

namespace PersonalProject.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExamCategoriesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ExamCategoriesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/ExamCategories
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ExamCategory>>> GetExamCategory()
        {
            return await _context.ExamCategory.ToListAsync();
        }

        // GET: api/ExamCategories/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ExamCategory>> GetExamCategory(int id)
        {
            var examCategory = await _context.ExamCategory.FindAsync(id);

            if (examCategory == null)
            {
                return NotFound();
            }

            return examCategory;
        }

        // PUT: api/ExamCategories/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutExamCategory(int id, ExamCategory examCategory)
        {
            if (id != examCategory.Id)
            {
                return BadRequest();
            }

            _context.Entry(examCategory).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ExamCategoryExists(id))
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

        // POST: api/ExamCategories
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<ExamCategory>> PostExamCategory(ExamCategory examCategory)
        {
            _context.ExamCategory.Add(examCategory);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetExamCategory", new { id = examCategory.Id }, examCategory);
        }

        // DELETE: api/ExamCategories/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteExamCategory(int id)
        {
            var examCategory = await _context.ExamCategory.FindAsync(id);
            if (examCategory == null)
            {
                return NotFound();
            }

            _context.ExamCategory.Remove(examCategory);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ExamCategoryExists(int id)
        {
            return _context.ExamCategory.Any(e => e.Id == id);
        }
    }
}
