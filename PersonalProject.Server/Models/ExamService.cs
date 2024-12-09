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
                                     .FirstOrDefaultAsync(e => e.CertId == certId);  // Ensure we're using the correct property name (ExamId)

            if (exam == null)
            {
                throw new KeyNotFoundException("Exam not found.");
            }

            return exam;
        }

        public async Task<UserCertificate> SubmitExamAsync(string userId, int certId, List<int> answerIds)
        {
            var exam = await GetExamByIdAsync(certId);

            if (exam == null || answerIds.Count != exam.Questions.Count)
            {
                throw new ArgumentException("Invalid exam or answer count mismatch.");
            }

            int score = 0;

            // Iterate over the questions and compare answers
            for (int i = 0; i < exam.Questions.Count; i++)
            {
                var question = exam.Questions.OrderBy(q => q.Id).ToList()[i]; // Ensure ordered by Id
                var answerOption = question.AnswerOptions.FirstOrDefault(a => a.Id == answerIds[i]);

                if (answerOption != null && answerOption.IsCorrect)
                {
                    score++;
                }
            }

            // Create a new UserCertificate to store the score
            var userCertificate = new UserCertificate
            {
                UserId = userId,  // Use the string UserId here
                CertId = certId,
                Score = score,
                DateTaken = DateTime.UtcNow
            };

            _context.UserCertificates.Add(userCertificate);
            await _context.SaveChangesAsync();

            return userCertificate;
        }

        public async Task<List<UserCertificate>> GetUserResultsAsync(string userId)
        {
            return await _context.UserCertificates
                                 .Where(r => r.UserId == userId)
                                 .Include(r => r.Certificate)  
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
