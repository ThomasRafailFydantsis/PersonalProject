using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PersonalProject.Server.Models;
using PersonalProject.Server.Data;
using System.ComponentModel.DataAnnotations;
using PersonalProject.Server.Filters;


namespace PersonalProject.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExamController : ControllerBase
    {
        private readonly ExamService _examService;

        public ExamController(ExamService examService)
        {
            _examService = examService;
        }
        [HttpGet("{CertId}")]
        [ServiceFilter(typeof(CustomJsonSerializationFilter))]
        public async Task<IActionResult> GetExamById(int CertId)
        {
            var exam = await _examService.GetExamByIdAsync(CertId);

            if (exam == null)
            {
                return NotFound();
            }

            return Ok(exam);  // Return the exam data
        }

        
        [HttpPost("create")]
        [ServiceFilter(typeof(CustomJsonSerializationFilter))]
        public async Task<IActionResult> CreateExam([FromBody] ExamCreationDto examDto)
        {
            if (examDto == null || !examDto.Questions.Any())
            {
                return BadRequest("Exam must have at least one question.");
            }

            var exam = await _examService.CreateExamAsync(examDto.CertName, examDto.Questions);

            if (exam == null)
            {
                return BadRequest("An error occurred while creating the exam.");
            }

            // Ensure you're returning the correct examId in the route
            return CreatedAtAction(nameof(GetExamById), new { certId = exam.CertId }, exam);
        }

        // Submit Exam (POST)
        [HttpPost("submit")]
        [ServiceFilter(typeof(CustomJsonSerializationFilter))]
        public async Task<IActionResult> SubmitExam([FromBody] SubmitExamDto submitDto)
        {
           
            // Validate input
            if (submitDto == null || submitDto.AnswerIds == null || !submitDto.AnswerIds.Any())
            {
                return BadRequest("Invalid request. Please provide answers.");
            }

            try
            {
                // Print received data to console for inspection
                Console.WriteLine($"Received SubmitExam request: UserId = {submitDto.UserId}, CertId = {submitDto.CertId}, AnswerIds = {string.Join(", ", submitDto.AnswerIds)}");

                var userCertificate = await _examService.SubmitExamAsync(submitDto.UserId, submitDto.CertId, submitDto.AnswerIds);

                // Print the userCertificate details to ensure it's correct
                Console.WriteLine($"User Certificate: {userCertificate.UserId}, {userCertificate.CertId}, Score: {userCertificate.Score}, DateTaken: {userCertificate.DateTaken}");

                // Return formatted response with nullable DateTime handled
                var result = new
                {
                    CertName = userCertificate.Certificate?.CertName ?? "Unknown Certificate",
                    Score = userCertificate.Score,
                    DateTaken = userCertificate.DateTaken?.ToString("yyyy-MM-dd HH:mm:ss") ?? "Date not available"
                };

                return Ok(result);
            }
            catch (DbUpdateException ex)
            {
                Console.WriteLine($"DbUpdateException: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");
                }
                throw; // Re-throw to ensure proper response
            }
            catch (ArgumentException ex)
            {
                // If we hit this exception, return the error message.
                Console.WriteLine($"ArgumentException: {ex.Message}");
                return BadRequest(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                // Print out error if exam is not found.
                Console.WriteLine($"KeyNotFoundException: {ex.Message}");
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                // Handle any unexpected errors and print details.
                Console.WriteLine($"Exception: {ex.Message}");
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        // Get User Exam Results (GET)
        [HttpGet("results/{userId}")]
        public async Task<IActionResult> GetUserResults(string userId)
        {
            var results = await _examService.GetUserResultsAsync(userId);

            if (results == null || results.Count == 0)
            {
                return NotFound("No results found for this user.");
            }

            var resultDtos = results.Select(r => new UserCertificateDto
            {
                CertName = r.Certificate.CertName,
                Score = r.Score,
                DateTaken = r.DateTaken
            }).ToList();

            return Ok(resultDtos); // Default serialization (no `$id` or `$values`)
        }
    }

    public class ExamCreationDto
    {
        public string CertName { get; set; }
        public List<QuestionDto> Questions { get; set; }
    }
    public class UserCertificateDto
    {
        public string UserId { get; set; }
        public string CertName { get; set; }
        public int? Score { get; set; }
        public DateTime? DateTaken { get; set; }
    }
    public class SubmitExamDto
    {
        public string UserId { get; set; }
        public int CertId { get; set; }
        public List<int> AnswerIds { get; set; } 
    }
}