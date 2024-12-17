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
                                     .Include(e => e.Questions)    // Load questions for this exam
                                         .ThenInclude(q => q.AnswerOptions)  // Load answer options for each question
                                     .FirstOrDefaultAsync(e => e.CertId == certId);  // Ensure we're using the correct property name (CertId)

            if (exam == null)
            {
                throw new KeyNotFoundException("Exam not found.");
            }

            return exam;
        }

        public async Task<UserCertificate> SubmitExamAsync(string userId, int certId, List<int> answerIds)
        {
            // Check if a certificate already exists for the user and certId
            var existingCertificate = await _context.UserCertificates
                .FirstOrDefaultAsync(c => c.UserId == userId && c.CertId == certId);

            if (existingCertificate != null)
            {
                // Option 1: Update the existing record with the new score and date
                existingCertificate.Score = CalculateScore(answerIds, certId);
                existingCertificate.DateTaken = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return existingCertificate;

                // Option 2: Return the existing record without any changes (if you don't want to overwrite)
                // return existingCertificate;
            }

            // Calculate the score (this logic can be extracted into a helper function)
            var score = CalculateScore(answerIds, certId);

            // Create a new certificate
            var userCertificate = new UserCertificate
            {
                UserId = userId,
                CertId = certId,
                Score = score,
                DateTaken = DateTime.UtcNow
            };
            if (existingCertificate != null)
            {
                Console.WriteLine($"Duplicate submission detected for UserId: {userId}, CertId: {certId}.");

                existingCertificate.Score = score;
                existingCertificate.DateTaken = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return existingCertificate;
            }

            // Save the new certificate
            _context.UserCertificates.Add(userCertificate);
            await _context.SaveChangesAsync();


            return userCertificate;
        }

        // Example helper function for score calculation
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
        public async Task<Certs> CreateExamAsync(string title, List<QuestionDto> questionDtos)
        {
            var cert = new Certs
            {
                CertName = title,
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
        public List<QuestionDto> Questions { get; set; }
    }
    public class QuestionDto
    {
        public string Text { get; set; }
        public string CorrectAnswer { get; set; }
        public List<AnswerOptionDto> AnswerOptions { get; set; }
    }
    public class AnswerOptionDto
    {
        public string Text { get; set; }
        public bool IsCorrect { get; set; }
    }
    public class SubmitExamDto
    {
        public int CertId { get; set; }
        public List<int> AnswerId { get; set; }
    }
}
