using Microsoft.EntityFrameworkCore;
using PersonalProject.Server.Data;

namespace PersonalProject.Server.Models
{
    public class ExamService
    {
        private readonly ApplicationDbContext _context;

        public ExamService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Certs> GetExamByIdAsync(int certId)
        {
            var exam = await _context.Certs
                                     .Include(e => e.Questions)
                                         .ThenInclude(q => q.AnswerOptions)
                                     .FirstOrDefaultAsync(e => e.CertId == certId);

            if (exam == null)
            {
                throw new KeyNotFoundException("Exam not found.");
            }

            return exam;
        }

        public async Task<UserCertificate> SubmitExamAsync(string userId, int certId, List<int> answerIds)
        {
            Console.WriteLine($"Submitting exam for UserId: {userId}, CertId: {certId}, AnswerIds: {string.Join(", ", answerIds)}");

            var certificate = await _context.Certs
                                            .Include(c => c.Questions)
                                            .ThenInclude(q => q.AnswerOptions)
                                            .FirstOrDefaultAsync(c => c.CertId == certId);

            if (certificate == null)
            {
                throw new KeyNotFoundException($"Certificate with ID {certId} not found.");
            }

            var score = CalculateScore(answerIds, certId);
            Console.WriteLine($"Calculated Score: {score}");

            var existingCertificate = await _context.UserCertificates
                                                    .FirstOrDefaultAsync(c => c.UserId == userId && c.CertId == certId);

            if (existingCertificate != null)
            {
                existingCertificate.Score = score;
                existingCertificate.DateTaken = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                return existingCertificate;
            }

            var userCertificate = new UserCertificate
            {
                UserId = userId,
                CertId = certId,
                Score = score,
                DateTaken = DateTime.UtcNow
            };

            _context.UserCertificates.Add(userCertificate);

            var examSubmission = new ExamSubmission
            {
                UserId = userId,
                CertId = certId,
                SubmissionDate = DateTime.UtcNow,
                Score = score,
                IsPassed = score >= certificate.PassingScore,
                Answers = answerIds.Select(answerId => new AnswerSubmission
                {
                    QuestionId = certificate.Questions.FirstOrDefault(q => q.AnswerOptions.Any(a => a.Id == answerId))?.Id ?? 0,
                    SelectedAnswerId = answerId,
                    IsCorrect = certificate.Questions.Any(q => q.AnswerOptions.Any(a => a.Id == answerId && a.IsCorrect))
                }).ToList()
            };

            _context.ExamSubmissions.Add(examSubmission);
            await _context.SaveChangesAsync();

            return userCertificate;
        }

        private int? CalculateScore(List<int> answerIds, int certId)
        {
            var exam = _context.Certs.Include(e => e.Questions)
                .ThenInclude(q => q.AnswerOptions)
                .FirstOrDefault(e => e.CertId == certId);

            if (exam == null) throw new KeyNotFoundException($"Exam with CertId {certId} not found.");

            int score = 0;
            var orderedQuestions = exam.Questions.OrderBy(q => q.Id).ToList();

            for (int i = 0; i < orderedQuestions.Count; i++)
            {
                var question = orderedQuestions[i];
                var selectedAnswer = question.AnswerOptions.FirstOrDefault(a => a.Id == answerIds[i]);
                if (selectedAnswer != null && selectedAnswer.IsCorrect) score++;
            }

            return score;
        }
        public async Task<List<UserCertificate>> GetUserResultsAsync(string userId)
        {
            return await _context.UserCertificates
                                 .Where(r => r.UserId == userId)
                                 .Include(r => r.Certificate) // Include the entire Certificate navigation property
                                 .OrderByDescending(r => r.DateTaken) // Order by DateTaken
                                 .ToListAsync();
        }
        public async Task<Certs> CreateExamAsync(string title, int passingScore, List<QuestionDto> questionDtos)
        {
            if (!questionDtos.Any(q => q.AnswerOptions.Any()))
            {
                throw new ArgumentException("Each question must have at least one answer option.");
            }

            var cert = new Certs
            {
                CertName = title,
                PassingScore = passingScore,
                Questions = questionDtos.Select(q => new Question
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

            return cert;
        }
    
    }
    public class ExamCreationDto
    {
        public string CertName { get; set; }
        public int PassingScore { get; set; }
        public List<QuestionDto> Questions { get; set; }
    }
    public class QuestionDto
    {
        public int Id { get; set; }
        public string Text { get; set; }
        public string CorrectAnswer { get; set; }
        public List<AnswerOptionDto> AnswerOptions { get; set; }
    }
    public class AnswerOptionDto
    {
        public int Id { get; set; }
        public string Text { get; set; }
        public bool IsCorrect { get; set; }
    }
    public class SubmitExamDto
    {
        public int CertId { get; set; }
        public List<int> AnswerId { get; set; }
    }
}
