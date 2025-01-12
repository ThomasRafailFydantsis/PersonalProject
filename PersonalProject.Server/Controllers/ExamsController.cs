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
using static PersonalProject.Server.Models.ExamService;
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
            try
            {
                var exam = await _examService.GetExamByIdAsync(CertId);

                if (exam == null)
                {
                    return NotFound();
                }

                return Ok(new
                {
                    exam.CertId,
                    exam.CertName,
                    exam.Cost,
                    exam.Reward,
                    exam.Description,
                    exam.CategoryId,
                    exam.PassingScore,
                    Category = new
                    {
                        exam.Category.Id,
                        exam.Category.Name 
                    },
                    Achievements = exam.CertAchievements.Select(a => new
                    {
                        a.AchievementId,
                        a.Achievement.Title 
                    }),
                    Questions = exam.Questions.Select(q => new
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
            catch (KeyNotFoundException)
            {
                return NotFound("Exam not found.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error retrieving exam: {ex.Message}");
                return StatusCode(500, "Internal server error.");
            }
        }

        [HttpPost("create")]
        [ServiceFilter(typeof(CustomJsonSerializationFilter))]
        public async Task<IActionResult> CreateExam([FromBody] ExamCreationDto examDto)
        {
            var categoryExists = await _context.ExamCategory.AnyAsync(c => c.Id == examDto.CategoryId);
            if (!categoryExists)
            {
                return BadRequest($"Category with ID {examDto.CategoryId} does not exist.");
            }

            if (!examDto.Questions.Any(q => q.AnswerOptions.Any()))
            {
                return BadRequest("Each question must have at least one answer option.");
            }

            var cert = new Certs
            {
                CertName = examDto.CertName,
                PassingScore = examDto.PassingScore,
                CategoryId = examDto.CategoryId,
                Reward = examDto.Reward,
                Cost = examDto.Cost,
                Questions = examDto.Questions.Select(q => new Question
                {
                    Text = q.Text,
                    CorrectAnswer = q.CorrectAnswer,
                    AnswerOptions = q.AnswerOptions.Select(a => new AnswerOption
                    {
                        Text = a.Text,
                        IsCorrect = a.IsCorrect
                    }).ToList()
                }).ToList()
            };

            _context.Certs.Add(cert);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetExamById), new { certId = cert.CertId }, cert);
        }
        [HttpPut("updatePassingScore/{certId}")]
        public async Task<IActionResult> UpdatePassingScore(int certId, [FromBody] int passingScore)
        {
            if (certId <= 0)
            {
                return BadRequest("Invalid CertId.");
            }

            if (passingScore < 0)
            {
                return BadRequest("Passing score must be a non-negative integer.");
            }

            try
            {
                var cert = await _context.Certs.FirstOrDefaultAsync(c => c.CertId == certId);

                if (cert == null)
                {
                    return NotFound("Exam not found.");
                }

                cert.PassingScore = passingScore;

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    Message = "Passing score updated successfully.",
                    cert.CertId,
                    cert.PassingScore
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating passing score: {ex.Message}");
                return StatusCode(500, "Internal server error.");
            }
        }
        [HttpPut("update/{certId}")]
        [ServiceFilter(typeof(CustomJsonSerializationFilter))]
        public async Task<IActionResult> UpdateExam(int certId, [FromBody] ExamUpdateDto examUpdateDto)
        {
            if (examUpdateDto == null || string.IsNullOrEmpty(examUpdateDto.CertName) || !examUpdateDto.Questions.Any())
            {
                return BadRequest("Invalid exam data.");
            }
            if (certId <= 0) return BadRequest("Invalid CertId");

            try
            {
                var cert = await _context.Certs
                    .Include(c => c.Questions)
                    .ThenInclude(q => q.AnswerOptions)
                    .Include(c => c.CertAchievements)
                    .FirstOrDefaultAsync(c => c.CertId == certId);

                if (cert == null) return NotFound("Exam not found.");

                cert.CertName = examUpdateDto.CertName;
                cert.CategoryId = examUpdateDto.CategoryId;
                cert.Cost = examUpdateDto.Cost;
                cert.Reward = examUpdateDto.Reward;
           

                cert.CertAchievements.Clear();
                foreach (var achievementId in examUpdateDto.AchievementIds)
                {
                    cert.CertAchievements.Add(new CertAchievement
                    {
                        CertId = cert.CertId,
                        AchievementId = achievementId
                    });
                }

                cert.Questions = examUpdateDto.Questions.Select(q => new Question
                {
                    Id = q.Id,
                    Text = q.Text,
                    CorrectAnswer = q.CorrectAnswer,
                    AnswerOptions = q.AnswerOptions.Select(a => new AnswerOption
                    {
                        Id = a.Id,
                        Text = a.Text,
                        IsCorrect = a.IsCorrect
                    }).ToList()
                }).ToList();

                await _context.SaveChangesAsync();
                return Ok(cert);
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
                return BadRequest("Invalid submission data. Answers are required.");
            }

            try
            {
                var result = await _examService.SubmitExamAsync(submitDto.UserId, submitDto.CertId, submitDto.AnswerIds);

                var user = await _context.Users
                                         .Include(u => u.UserAchievements!)
                                         .ThenInclude(ua => ua.Achievement)
                                         .FirstOrDefaultAsync(u => u.Id == submitDto.UserId);

                if (user == null)
                {
                    return NotFound(new { Message = "User not found." });
                }

                var unlockedAchievements = user.UserAchievements?
                    .Where(ua => ua.UnlockedOn >= DateTime.UtcNow.AddMinutes(-1) && ua.Achievement != null)
                    .Select(ua => new
                    {
                        title = ua.Achievement.Title, 
                        description = ua.Achievement.Description ,
                        reward = ua.Achievement.RewardCoins
                    })
                    .ToList();

                return Ok(new
                {
                    CertName = result.Certificate?.CertName ?? "Unknown",
                    Score = result.Score,
                    Passed = result.IsPassed,
                    DateTaken = DateTime.UtcNow,
                    Reward = result.IsPassed && result.Certificate?.IsFree == true ? result.Certificate.Reward : 0,
                    Achievements = unlockedAchievements
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { ex.Message });
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
                    IsMarked = _context.MarkerAssignments.Any(ma => ma.ExamSubmissionId == es.Id && ma.IsMarked), 
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

            var existingAssignment = await _context.MarkerAssignments
                .FirstOrDefaultAsync(ma => ma.ExamSubmissionId == assignmentDto.ExamSubmissionId);

            if (existingAssignment != null && existingAssignment.IsMarked)
            {
                return BadRequest("This submission is already assigned.");
            }

            var markerAssignment = new MarkerAssignment
            {
                ExamSubmissionId = assignmentDto.ExamSubmissionId,
                MarkerId = assignmentDto.MarkerId,
                AssignedDate = DateTime.UtcNow,
                IsMarked = false 
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

            var submission = await _context.ExamSubmissions
                .FirstOrDefaultAsync(es => es.UserId == userCertificate.UserId && es.CertId == userCertificate.CertId);

            var markerAssignment = await _context.MarkerAssignments
                .FirstOrDefaultAsync(ma => ma.ExamSubmissionId == submission.Id);
            //if not
            if (!userCertificate.IsPassed || markerAssignment == null || !markerAssignment.IsMarked)
            {
                return BadRequest("The exam is either not marked, or the candidate did not pass.");
            }

            // Generate 
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

               
                XFont titleFont = new XFont("Arial", 36, XFontStyle.Bold);  
                XFont subtitleFont = new XFont("Arial", 24, XFontStyle.Bold); 
                XFont textFont = new XFont("Arial", 14);  

                XBrush blackBrush = new XSolidBrush(XColor.FromArgb(0, 0, 0));
                XBrush certFlixBrush = new XSolidBrush(XColor.FromArgb(96, 125, 139));
                XFont Signature = new XFont ("Blackadder ITC", 12, XFontStyle.Bold);
                
                XColor outerBorderColor = XColor.FromArgb(255, 140, 0);  
                XColor innerBorderColor = XColor.FromArgb(96, 125, 139); 

                XPen outerBorderPen = new XPen(outerBorderColor, 6);  
                XPen innerBorderPen = new XPen(innerBorderColor, 3);  

                // Set page size and margins
                page.Width = 700;
                page.Height = 500;
                double margin = 0;
                double verticalSpacing = 20;  
                double textHeight = 50;  
                double w = 14;
                double e = 91;

                // Draw the outer border 
                gfx.DrawRectangle(outerBorderPen, margin, margin, page.Width - 2 * margin, page.Height - 2 * margin);

                // Draw the inner border 
                gfx.DrawRectangle(innerBorderPen, margin + 10, margin + 10, page.Width - 2 * margin - 20, page.Height - 2 * margin - 20);

                // Title of the certificate 
                gfx.DrawString("Certificate of Achievement", titleFont, blackBrush,
                    new XRect(margin -5, margin + 90, page.Width - 2 * margin, textHeight), XStringFormats.TopCenter);

                // Company name ("CertFlix") 
                gfx.DrawString("CertFlix", subtitleFont, certFlixBrush,
                    new XRect(margin -5, margin + 150, page.Width - 2 * margin, textHeight), XStringFormats.TopCenter);

                // Congratulatory message
                gfx.DrawString($"This certifies that", subtitleFont, blackBrush,
                    new XRect(margin - 5, margin + 210, page.Width - 2 * margin, textHeight), XStringFormats.TopCenter);

                // Recipient's name 
                gfx.DrawString($"{userCertificate.User.FirstName} {userCertificate.User.LastName}", titleFont, blackBrush,
                    new XRect(margin - 5, margin + 260, page.Width - 2 * margin, textHeight), XStringFormats.TopCenter);

                // Certificate description 
                gfx.DrawString($"Has successfully completed the {userCertificate.Certificate.CertName} exam", textFont, blackBrush,
                    new XRect(margin - 5, margin + 315, page.Width - 2 * margin, textHeight), XStringFormats.TopCenter);

                // Date of issue 
                gfx.DrawString($"Date of Issue: {DateTime.Now:MMMM dd, yyyy}", textFont, blackBrush,
                    new XRect(w, e + 300 + verticalSpacing, page.Width - 2 * margin, textHeight), XStringFormats.TopLeft);

                // Signature line 
                gfx.DrawString("Issued by: Certflix", textFont, blackBrush,
                    new XRect(w, e + 330 + verticalSpacing, page.Width - 2 * margin, textHeight), XStringFormats.TopLeft);

                // Owner of the certificate 
                gfx.DrawString("CEO : Antwnhs Remos", textFont, blackBrush,
                    new XRect(w, e + 360 + verticalSpacing, page.Width - 2 * margin, textHeight), XStringFormats.TopLeft);

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
                .Include(es => es.Answers)
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
                    answerOptions = a.Question?.AnswerOptions.Select(opt => new
                    {
                        opt.Id,
                        opt.Text,
                        opt.IsCorrect
                    }).ToList()
                })
            };

            return Ok(submissionDetails);
        }
        [HttpGet("marker-assignments/{markerId}")]
        public async Task<IActionResult> GetMarkerAssignments(string markerId) 
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
                    isPassed = ma.ExamSubmission.IsPassed,
                    isMarked = ma.IsMarked 
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
            if (dto == null || dto.GradingData == null || !dto.GradingData.Any())
            {
                return BadRequest("Invalid grading data.");
            }

            var submission = await _context.ExamSubmissions
                .Include(es => es.Answers)
                .ThenInclude(a => a.Question)
                .ThenInclude(q => q.AnswerOptions)
                .Include(es => es.Certificate)
                .Include(es => es.MarkerAssignments)
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

            // Calculate the number of correct answers
            int correctAnswers = submission.Answers.Count(a => a.IsCorrect);

            // Calculate the percentage score
            int totalQuestions = submission.Certificate.Questions.Count;
            double percentageScore = totalQuestions > 0 ? Math.Round((double)correctAnswers / totalQuestions * 100) : 0;

            // Update submission score and pass status
            submission.Score = (int)percentageScore;
            submission.IsPassed = percentageScore >= submission.Certificate.PassingScore;

            // Handle marker assignment
            var markerAssignment = submission.MarkerAssignments.FirstOrDefault();
            if (markerAssignment != null)
            {
                if (_context.Entry(markerAssignment).State == EntityState.Detached)
                {
                    _context.Attach(markerAssignment);
                }
                markerAssignment.IsMarked = true;
                Console.WriteLine($"MarkerAssignment for Submission ID {submission.Id} is now marked.");
            }
            else
            {
                return BadRequest("No marker assignment found for this submission.");
            }

            // Update or create the UserCertificate
            var userCertificate = await _context.UserCertificates
                .FirstOrDefaultAsync(uc => uc.UserId == submission.UserId && uc.CertId == submission.CertId);

            if (userCertificate != null)
            {
                userCertificate.Score = (int)percentageScore;
                userCertificate.IsPassed = submission.IsPassed;
                userCertificate.DateTaken = DateTime.UtcNow;
            }
            else
            {
                userCertificate = new UserCertificate
                {
                    UserId = submission.UserId,
                    CertId = submission.CertId,
                    Score = (int)percentageScore,
                    IsPassed = submission.IsPassed,
                    DateTaken = DateTime.UtcNow
                };
                _context.UserCertificates.Add(userCertificate);
            }

            // Save changes to the database
            await _context.SaveChangesAsync();

            // Return the response
            return Ok(new
            {
                submission.Id,
                Score = percentageScore,
                submission.IsPassed,
                IsMarked = markerAssignment?.IsMarked ?? false,
                UserCertificate = new
                {
                    userCertificate.Id,
                    userCertificate.Score,
                    userCertificate.IsPassed,
                    userCertificate.DateTaken
                }
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
                    Cost = uc.Certificate.Cost,
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
        public int Reward { get; set; }
        public int Cost { get; set; }
        public int CategoryId { get; set; }
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
        public int Cost { get; set; }
        public List<int> AchievementIds { get; set; } // Changed to List<int>
        public int Reward { get; set; }
        public int CategoryId { get; set; }
       
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
    public class ExamSubmissionDto
    {
        public string UserId { get; set; }
        public int CertId { get; set; }
        public List<int> AnswerIds { get; set; }
       
    }
}