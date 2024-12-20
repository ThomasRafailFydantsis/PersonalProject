using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PersonalProject.Server.Models;
using PersonalProject.Server.Data;
using System.ComponentModel.DataAnnotations;
using PersonalProject.Server.Filters;
using NuGet.Packaging;
using Microsoft.AspNetCore.Authorization;
using PdfSharpCore.Drawing;
using PdfSharpCore.Pdf;
//using System;
//using System.IO;
//using System.Threading.Tasks;
//using PdfSharp.Drawing;
//using PdfSharp.Drawing;
//using PdfSharp.Pdf;
//using System;
//using System.IO;
//using System.Threading.Tasks;

namespace PersonalProject.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExamController : ControllerBase
    {
        private readonly ExamService _examService;
        private readonly ApplicationDbContext _context;

        public ExamController(ExamService examService, ApplicationDbContext context)
        {
            _examService = examService;
            this._context = context;
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

            var exam = await _examService.CreateExamAsync(examDto.CertName, examDto.PassingScore, examDto.Questions);

            if (exam == null)
            {
                return BadRequest("An error occurred while creating the exam.");
            }

            return CreatedAtAction(nameof(GetExamById), new { certId = exam.CertId }, exam); // Examservice for context
        }

        [HttpPut("update/{certId}")]
        public async Task<IActionResult> UpdateExam(int certId, [FromBody] ExamUpdateDto examUpdateDto) // Update
        {
            if (examUpdateDto == null || string.IsNullOrEmpty(examUpdateDto.CertName) || !examUpdateDto.Questions.Any())
            {
                return BadRequest("Invalid exam data.");
            }
            if (certId <= 0)
            {
                return BadRequest("Invalid CertId");
            }
            try
            {
                var cert = await _context.Certs.Include(c => c.Questions)
                                               .ThenInclude(q => q.AnswerOptions)
                                               .FirstOrDefaultAsync(c => c.CertId == certId);

                if (cert == null)
                {
                    return NotFound("Exam not found.");
                }

                cert.CertName = examUpdateDto.CertName;

                // Update questions and answer options
                foreach (var questionDto in examUpdateDto.Questions)
                {
                    var existingQuestion = cert.Questions.FirstOrDefault(q => q.Id == questionDto.Id);

                    if (existingQuestion != null) // Update existing question
                    {
                        existingQuestion.Text = questionDto.Text;
                        existingQuestion.CorrectAnswer = questionDto.CorrectAnswer;

                        existingQuestion.AnswerOptions.Clear();
                        foreach (var answerDto in questionDto.AnswerOptions)
                        {
                            existingQuestion.AnswerOptions.Add(new AnswerOption
                            {
                                Id = answerDto.Id,
                                Text = answerDto.Text,
                                IsCorrect = answerDto.IsCorrect,
                            });
                        }
                    }
                    else
                    {
                        cert.Questions.Add(new Question // Add new question
                        {
                            Text = questionDto.Text,
                            CorrectAnswer = questionDto.CorrectAnswer,
                            AnswerOptions = questionDto.AnswerOptions.Select(a => new AnswerOption
                            {
                                Text = a.Text,
                                IsCorrect = a.IsCorrect,
                            }).ToList()
                        });
                    }
                }

                await _context.SaveChangesAsync();
                return Ok(new
                {
                    cert.CertId,
                    cert.CertName,
                    cert.PassingScore,
                    Questions = cert.Questions.Select(q => new
                    {
                        q.Id,
                        q.Text,
                        q.CorrectAnswer,
                        AnswerOptions = q.AnswerOptions.Select(a => new
                        {
                            a.Id,
                            a.Text,
                            a.IsCorrect
                        })
                    })
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating exam: {ex.Message}");
                return StatusCode(500, "Internal server error.");
            }
        }

        [HttpPost("submit")]
        public async Task<IActionResult> SubmitExam([FromBody] SubmitExamDto submitDto)
        {
            if (submitDto == null || submitDto.AnswerIds == null || !submitDto.AnswerIds.Any())
            {
                return BadRequest("Invalid request. Please provide answers.");
            }

            try
            {
                // Fetch the certificate and its questions
                var certificate = await _context.Certs
                    .Include(c => c.Questions)
                    .ThenInclude(q => q.AnswerOptions)
                    .FirstOrDefaultAsync(c => c.CertId == submitDto.CertId);

                if (certificate == null)
                {
                    return NotFound("Certificate not found.");
                }

                // Calculate the score
                int score = 0;
                var answers = new List<AnswerSubmission>();
                foreach (var answerId in submitDto.AnswerIds)
                {
                    var question = certificate.Questions
                        .FirstOrDefault(q => q.AnswerOptions.Any(a => a.Id == answerId));

                    if (question != null)
                    {
                        var selectedAnswer = question.AnswerOptions.First(a => a.Id == answerId);
                        answers.Add(new AnswerSubmission
                        {
                            QuestionId = question.Id,
                            SelectedAnswerId = selectedAnswer.Id,
                            IsCorrect = selectedAnswer.IsCorrect
                        });

                        if (selectedAnswer.IsCorrect)
                        {
                            score++;
                        }
                    }
                }
               
                bool isPassed = score >= certificate.PassingScore; // On Create / Update

                var examSubmission = new ExamSubmission
                {
                    UserId = submitDto.UserId,
                    CertId = submitDto.CertId,
                    SubmissionDate = DateTime.UtcNow,
                    Score = score,
                    IsPassed = isPassed,
                    Answers = answers
                };

                _context.ExamSubmissions.Add(examSubmission);

                var existingCertificate = await _context.UserCertificates
                    .FirstOrDefaultAsync(uc => uc.UserId == submitDto.UserId && uc.CertId == submitDto.CertId); // Check if certificate already exists

                if (existingCertificate != null) // Update existing certificate
                {
                    existingCertificate.Score = score;
                    existingCertificate.DateTaken = DateTime.UtcNow;
                    existingCertificate.IsPassed = isPassed;
                }
                else // Add new certificate, TODO: update so the user can only take the cert till they pass
                {
                    var userCertificate = new UserCertificate
                    {
                        UserId = submitDto.UserId,
                        CertId = submitDto.CertId,
                        Score = score,
                        DateTaken = DateTime.UtcNow,
                        IsPassed = isPassed
                    };

                    _context.UserCertificates.Add(userCertificate);
                }

                await _context.SaveChangesAsync();

                
                return Ok(new
                {
                    CertName = certificate.CertName,
                    Score = score,
                    Passed = isPassed,
                    DateTaken = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in SubmitExam: {ex.Message}");
                return StatusCode(500, "An error occurred while submitting the exam.");
            }
        }

        [HttpGet("attempts")]
        public async Task<IActionResult> GetAllAttempts([FromQuery] int? certId, [FromQuery] string? userId)
        {
            try
            {
                var query = _context.ExamSubmissions.AsQueryable();

                Console.WriteLine($"GetAllAttempts called with certId: {certId}, userId: {userId}");

                if (certId.HasValue)
                {
                    query = query.Where(es => es.CertId == certId);
                    Console.WriteLine($"Filter applied: CertId = {certId}");
                }

                if (!string.IsNullOrEmpty(userId))
                {
                    query = query.Where(es => es.UserId == userId);
                    Console.WriteLine($"Filter applied: UserId = {userId}");
                }

                
                var attempts = await query
                    .Include(es => es.User)
                    .Include(es => es.Certificate)
                    .Include(es => es.Answers)
                    .ToListAsync();

                if (!attempts.Any())
                {
                    Console.WriteLine("No attempts found for the given filters.");
                    return NotFound(new { Message = "No attempts found for the given filters." });
                }
  
                var result = attempts.Select(es => new
                {
                    es.Id,
                    es.CertId,
                    UserId = es.UserId ?? "Unknown User",
                    CertName = es.Certificate?.CertName ?? "Unknown Certificate", 
                    es.Score,
                    es.IsPassed,
                    SubmissionDate = es.SubmissionDate.ToString("yyyy-MM-dd HH:mm:ss"),
                    Answers = es.Answers.Select(a => new
                    {
                        a.QuestionId,
                        a.SelectedAnswerId,
                        a.IsCorrect
                    })
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                
                Console.WriteLine($"Exception in GetAllAttempts: {ex.Message}");
                return StatusCode(500, new { Message = "An error occurred while retrieving exam attempts.", Error = ex.Message });
            }
        }

        [HttpPost("assign-marker")]
       
        public async Task<IActionResult> AssignMarker([FromBody] MarkerAssignmentDto assignmentDto)
        {
            if (assignmentDto == null || string.IsNullOrEmpty(assignmentDto.MarkerId))
            {
                return BadRequest("Invalid marker assignment data.");
            }

            var submission = await _context.ExamSubmissions
                .FirstOrDefaultAsync(es => es.Id == assignmentDto.ExamSubmissionId);

            if (submission == null)
            {
                return NotFound("Exam submission not found.");
            }

            var markerAssignment = new MarkerAssignment
            {
                ExamSubmissionId = assignmentDto.ExamSubmissionId,
                MarkerId = assignmentDto.MarkerId,
                AssignedDate = DateTime.UtcNow
            };

            _context.MarkerAssignments.Add(markerAssignment);
            await _context.SaveChangesAsync();

            return Ok("Marker assigned successfully.");
        }

        [HttpGet("certificate/{userCertificateId}")]
        public async Task<IActionResult> GenerateCertificate(int userCertificateId)
        {
            var userCertificate = await _context.UserCertificates
                .Include(uc => uc.User)
                .Include(uc => uc.Certificate)
                .FirstOrDefaultAsync(uc => uc.Id == userCertificateId);

            if (userCertificate == null)
            {
                return BadRequest("Certificate not available for this user.");
            }

            // Check if passed and marked
            var submission = await _context.ExamSubmissions
                .FirstOrDefaultAsync(es => es.UserId == userCertificate.UserId && es.CertId == userCertificate.CertId);

            var markerAssignment = await _context.MarkerAssignments
                .FirstOrDefaultAsync(ma => ma.ExamSubmissionId == submission.Id);

            if (!userCertificate.IsPassed || markerAssignment == null || !markerAssignment.IsMarked)
            {
                return BadRequest("The exam is either not marked, or the candidate did not pass.");
            }

            // Generate the PDF certificate
            var pdfBytes = GenerateCertificatePdf(userCertificate);

            userCertificate.IsCertificateGenerated = true;
            userCertificate.CertificateFilePath = $"certificates/{userCertificateId}.pdf";
            await _context.SaveChangesAsync();

            var fileName = $"{userCertificate.User.FirstName}_Certificate.pdf";
            return File(pdfBytes, "application/pdf", fileName);
        }

        private byte[] GenerateCertificatePdf(UserCertificate userCertificate)
        {
            using (var memoryStream = new MemoryStream())
            {
                // Create a new PDF document
                PdfDocument document = new PdfDocument();
                PdfPage page = document.AddPage();
                XGraphics gfx = XGraphics.FromPdfPage(page);

                // Set up fonts and colors
                XFont titleFont = new XFont("Times New Roman", 48, XFontStyle.Bold);  // Prestigious font for the title
                XFont subtitleFont = new XFont("Times New Roman", 18, XFontStyle.Bold);  // Subheading font
                XFont textFont = new XFont("Times New Roman", 14);  // Body text font

                XBrush blackBrush = new XSolidBrush(XColor.FromArgb(0, 0, 0));  // Black for text
                XBrush goldBrush = new XSolidBrush(XColor.FromArgb(255, 223, 0));  // Gold for accents (used for company name)

                // Define the border color using XColor (Dark Red)
                XColor darkRedColor = XColor.FromArgb(130, 0, 0);  // Dark Red for borders
                XPen borderPen = new XPen(darkRedColor, 3);  // Pen for border color and thickness

                // Set page size and margins
                page.Width = 700;
                page.Height = 500;
                double margin = 60;

                // Draw elegant border using XPen (NOT XBrush)
                gfx.DrawRectangle(borderPen, margin, margin, page.Width - 2 * margin, page.Height - 2 * margin);

                // Title of the certificate (centered text in black color)
                gfx.DrawString("Certificate of Achievement", titleFont, blackBrush,
                    new XRect(margin, 120, page.Width - margin, 50), XStringFormats.TopCenter);

                // Company name (CertFlix, text in gold color)
                gfx.DrawString("CertFlix", subtitleFont, goldBrush,
                    new XRect(margin, 180, page.Width - margin, 50), XStringFormats.TopCenter);

                // Congratulatory message (text in black)
                gfx.DrawString($"This certifies that", subtitleFont, blackBrush,
                    new XRect(margin, 250, page.Width - margin, 50), XStringFormats.TopCenter);

                // Recipient's name (centered, large font size)
                gfx.DrawString($"{userCertificate.User.FirstName} {userCertificate.User.LastName}", titleFont, blackBrush,
                    new XRect(margin, 300, page.Width - margin, 50), XStringFormats.TopCenter);

                // Certificate description (body text in black)
                gfx.DrawString($"Has successfully completed the {userCertificate.Certificate.CertName} exam", textFont, blackBrush,
                    new XRect(margin, 370, page.Width - margin, 50), XStringFormats.TopCenter);

                // Date of issue (text in black)
                gfx.DrawString($"Date of Issue: {DateTime.Now:MMMM dd, yyyy}", textFont, blackBrush,
                    new XRect(margin, 400, page.Width - margin, 50), XStringFormats.TopLeft);

                // Signature line (text in black)
                gfx.DrawString("Signature: ______________________", textFont, blackBrush,
                    new XRect(margin, 440, page.Width - margin, 50), XStringFormats.TopLeft);

                // Owner of the certificate (text in black)
                gfx.DrawString("Antwnhs Remos", textFont, blackBrush,
                    new XRect(margin, 460, page.Width - margin, 50), XStringFormats.TopLeft);

                // Save the document to the memory stream
                document.Save(memoryStream);
                return memoryStream.ToArray();
            }
        }
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

            return Ok(resultDtos);
        }

        [HttpGet("submission/{examSubmissionId}")]
        public async Task<IActionResult> GetExamSubmission(int examSubmissionId)
        {
            var submission = await _context.ExamSubmissions
                .Include(es => es.User) 
                .Include(es => es.Certificate)
                .Include(es => es.Answers) // correct answer
                    .ThenInclude(a => a.Question)
                    .ThenInclude(q => q.AnswerOptions)
                .FirstOrDefaultAsync(es => es.Id == examSubmissionId);

            if (submission == null)
            {
                return NotFound($"Submission with ID {examSubmissionId} not found.");
            }

            var submissionDetails = new
            {
                examSubmissionId = submission.Id,
                candidateName = submission.User?.UserName, 
                candidateId = submission.User?.Id, 
                certificateName = submission.Certificate?.CertName, 
                submissionDate = submission.SubmissionDate,
                score = submission.Score,
                isPassed = submission.IsPassed,
                answers = submission.Answers.Select(a => new
                {
                    questionId = a.QuestionId,
                    questionText = a.Question?.Text,
                    selectedAnswerId = a.SelectedAnswerId,
                    answerText = a.Question?.AnswerOptions?.FirstOrDefault(ans => ans.Id == a.SelectedAnswerId)?.Text, 
                    isCorrect = a.IsCorrect,
                    correctAnswer = a.Question?.AnswerOptions?.FirstOrDefault(ans => ans.IsCorrect)?.Text, 
                })
            };

            return Ok(submissionDetails);
        }
        [HttpGet("marker-assignments/{markerId}")]
        public async Task<IActionResult> GetMarkerAssignments(string markerId) // Markers can view their own assignments
        {
            var assignments = await _context.MarkerAssignments
                .Where(ma => ma.MarkerId == markerId)
                .Include(ma => ma.ExamSubmission) 
                .ThenInclude(es => es.User) 
                .Include(ma => ma.ExamSubmission.Certificate) 
                .Select(ma => new
                {
                    ma.Id, 
                    ma.ExamSubmissionId,
                    ma.MarkerId,
                    candidateName = ma.ExamSubmission.User.UserName,
                    candidateId = ma.ExamSubmission.User.Id,
                    certificateName = ma.ExamSubmission.Certificate.CertName,
                    submissionDate = ma.ExamSubmission.SubmissionDate,
                    score = ma.ExamSubmission.Score,
                    isPassed = ma.ExamSubmission.IsPassed
                })
                .ToListAsync();

            if (assignments == null || !assignments.Any())
            {
                return NotFound($"No assignments found for marker {markerId}.");
            }

            return Ok(assignments);
        }

        [HttpPost("grade-submission")]
        public async Task<IActionResult> GradeSubmission([FromBody] GradeSubmissionDto dto)
        {
            if (dto == null || !dto.GradingData.Any())
            {
                return BadRequest("Invalid grading data.");
            }

            var submission = await _context.ExamSubmissions
                .Include(es => es.Answers)
                .ThenInclude(a => a.Question)
                .ThenInclude(q => q.AnswerOptions)
                .Include(es => es.Certificate)
                .Include(es => es.MarkerAssignments)  // Ensure we load marker assignments
                .FirstOrDefaultAsync(es => es.Id == dto.ExamSubmissionId);

            if (submission == null)
            {
                return NotFound($"Submission with ID {dto.ExamSubmissionId} not found.");
            }

            foreach (var answer in submission.Answers)
            {
                if (dto.GradingData.TryGetValue(answer.QuestionId, out var selectedAnswerId))
                {
                    answer.SelectedAnswerId = selectedAnswerId;
                    answer.IsCorrect = answer.Question?.AnswerOptions?.Any(a => a.Id == selectedAnswerId && a.IsCorrect) ?? false;
                }
            }

            submission.Score = submission.Answers.Count(a => a.IsCorrect);
            submission.IsPassed = submission.Score >= submission.Certificate.PassingScore;

            // Update marker assignment
            var markerAssignment = submission.MarkerAssignments.FirstOrDefault();
            if (markerAssignment != null)
            {
                markerAssignment.IsMarked = true;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                submission.Id,
                submission.Score,
                submission.IsPassed,
                IsMarked = markerAssignment?.IsMarked ?? false
            });
        }

        [HttpGet("user-certificates/{userId}")]
        public async Task<IActionResult> GetUserCertificates(string userId)
        {
            var certificates = await _context.UserCertificates
                .Include(uc => uc.Certificate)
                .Where(uc => uc.UserId == userId)
                .Select(uc => new
                {
                    uc.Id,
                    CertificateName = uc.Certificate.CertName,
                    uc.DateTaken,
                    uc.Score,
                    uc.IsPassed,
                    IsMarked = _context.MarkerAssignments
                        .Any(ma => ma.ExamSubmissionId == _context.ExamSubmissions
                            .Where(es => es.UserId == userId && es.CertId == uc.CertId)
                            .Select(es => es.Id)
                            .FirstOrDefault() && ma.IsMarked),
                    CertificateDownloadable = uc.IsPassed &&
                        _context.MarkerAssignments
                            .Any(ma => ma.ExamSubmissionId == _context.ExamSubmissions
                                .Where(es => es.UserId == userId && es.CertId == uc.CertId)
                                .Select(es => es.Id)
                                .FirstOrDefault() && ma.IsMarked)
                })
                .ToListAsync();

            if (!certificates.Any())
            {
                return NotFound("No certificates found for this user.");
            }

            return Ok(certificates);
        }
    }
    public class GradeSubmissionDto
    {
        [Required]
        public int ExamSubmissionId { get; set; }

        [Required]
        public Dictionary<int, int> GradingData { get; set; } = new();
    }

    public class ExamCreationDto
    {
        public string CertName { get; set; }
        public int PassingScore { get; set; }
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

    public class ExamUpdateDto
    {
        public string CertName { get; set; }
        public List<QuestionDto> Questions { get; set; }
    }

    public class AnswerOptionDto
    {
        public int Id { get; set; } 
        public string Text { get; set; }
        public bool IsCorrect { get; set; }
    }
    public class MarkerAssignmentDto
    {
        public int ExamSubmissionId { get; set; }
        public string MarkerId { get; set; }

    }
    public class ExamAttemptDto
    {
        public string UserId { get; set; }
        public int CertId { get; set; }
        public List<AnswerDto> Answers { get; set; } = new List<AnswerDto>();
        public int PassingScore { get; set; }  
    }

    public class AnswerDto
    {
        public int QuestionId { get; set; }
        public int SelectedAnswerId { get; set; }
        public bool IsCorrect { get; set; }  
    }
    public class CertificateDownloadDto
    {
        public int UserCertificateId { get; set; }
        public string UserName { get; set; }
        public string CertificateName { get; set; }
        public DateTime DateGenerated { get; set; }
    }
    public class ExamSubmissionResponseDto
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public int CertId { get; set; }
        public string CertName { get; set; }
        public DateTime SubmissionDate { get; set; }
        public int Score { get; set; }
        public bool IsPassed { get; set; }
        public List<AnswerSubmissionDto> Answers { get; set; }
    }

    public class AnswerSubmissionDto
    {
        public int QuestionId { get; set; }
        public int SelectedAnswerId { get; set; }
        public bool IsCorrect { get; set; }
    }
}