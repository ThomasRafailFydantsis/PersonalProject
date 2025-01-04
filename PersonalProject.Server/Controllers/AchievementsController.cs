using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text.Json.Serialization;
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
    public class AchievementsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AchievementsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Achievement>>> GetAchievements()
        {
            return await _context.Achievements.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAchievementById(int id)
        {
            var achievement = await _context.Achievements.FindAsync(id);
            if (achievement == null)
            {
                return NotFound(new { Message = $"Achievement with ID {id} not found." });
            }

            return Ok(achievement);
        }
        [HttpPost("create")]
        public async Task<IActionResult> CreateAchievement([FromBody] CreateAchievementDto achievementDto)
        {
            if (achievementDto == null)
            {
                return BadRequest(new { Message = "Achievement data is required." });
            }

       

            var achievement = new Achievement
            {
                Title = achievementDto.Title,
                Description = achievementDto.Description,
                RewardCoins = achievementDto.RewardCoins,
                RequiredStreak = achievementDto.RequiredStreak,
                Type = achievementDto.Type
            };

            try
            {
                _context.Achievements.Add(achievement);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetAchievementById), new { id = achievement.Id }, achievement);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating achievement: {ex.Message}");
                return StatusCode(500, new { Message = "An error occurred while creating the achievement." });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutAchievement(int id, Achievement achievement)
        {
            if (id != achievement.Id)
            {
                return BadRequest();
            }

            _context.Entry(achievement).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AchievementExists(id))
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

        

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAchievement(int id)
        {
            var achievement = await _context.Achievements.FindAsync(id);
            if (achievement == null)
            {
                return NotFound();
            }

            _context.Achievements.Remove(achievement);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AchievementExists(int id)
        {
            return _context.Achievements.Any(e => e.Id == id);
        }
    }
    public class CreateAchievementDto
    {
        [Required]
        [MaxLength(255)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;
        public int RequiredStreak { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int RewardCoins { get; set; } = 0;

       

        [Required]
        [JsonConverter(typeof(JsonStringEnumConverter))] 
        public AchievementType Type { get; set; } = AchievementType.ExamBased;
    }
}
