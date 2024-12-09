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
            if (submitDto == null || !submitDto.AnswerIds.Any())
            {
                return BadRequest("No answers provided.");
            }

            var userCertificate = await _examService.SubmitExamAsync(submitDto.UserId, submitDto.CertId, submitDto.AnswerIds);

            var resultDto = new UserCertificateDto
            {
                CertName = userCertificate.Certificate.CertName,
                Score = userCertificate.Score,
                DateTaken = userCertificate.DateTaken
            };

            return Ok(resultDto);
        }

        // Get User Exam Results (GET)
        [HttpGet("results/{userId}")]
        [ServiceFilter(typeof(CustomJsonSerializationFilter))]
        public async Task<IActionResult> GetUserResults(string userId)
        {
            var results = await _examService.GetUserResultsAsync(userId);

            if (results == null || !results.Any())
            {
                return NotFound("No results found for this user.");
            }

            var resultDtos = results.Select(r => new UserCertificateDto
            {
                CertName = r.Certificate.CertName,
                Score = r.Score,
                DateTaken = r.DateTaken
            }).ToList();

            return Ok(resultDtos);
        }
    }

    public class ExamCreationDto
    {
        public string CertName { get; set; }
        public List<QuestionDto> Questions { get; set; }
    }
    public class UserCertificateDto
    {
        public string CertName { get; set; }
        public int Score { get; set; }
        public DateTime DateTaken { get; set; }
    }
    public class SubmitExamDto
    {
        public string UserId { get; set; }
        public int CertId { get; set; }
        public List<int> AnswerIds { get; set; } 
    }
}