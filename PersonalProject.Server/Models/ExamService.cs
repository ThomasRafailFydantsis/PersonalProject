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
                .Include(e => e.CertAchievements)
                    .ThenInclude(ca => ca.Achievement)
                .Include(e => e.Category)
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
                throw new KeyNotFoundException($"Certificate with ID {certId} not found.");

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                throw new KeyNotFoundException($"User with ID {userId} not found.");

            if (!certificate.IsFree)
            {
                // Paid exam logic
                if (user.Coins < certificate.Cost)
                    throw new InvalidOperationException("Insufficient coins for this exam.");

                user.Coins -= certificate.Cost; // Deduct the cost
            }

            int score = 0;
            bool isPassed = false;

            if (certificate.IsFree)
            {
                // Free exam logic
                score = CalculateScore(answerIds, certId);
                isPassed = score >= certificate.PassingScore;

                if (isPassed)
                {
                    user.Coins += certificate.Reward; // Reward coins for passing
                }

                Console.WriteLine($"Free exam processed: Score={score}, Passed={isPassed}, Reward={certificate.Reward}");
            }
            else
            {
                // Paid exam logic: Submit for grading
                score = CalculateScore(answerIds, certId);
                isPassed = score >= certificate.PassingScore;

                Console.WriteLine($"Paid exam processed: Score={score}, Passed={isPassed}");
            }

            var existingCertificate = await _context.UserCertificates
                                                    .FirstOrDefaultAsync(c => c.UserId == userId && c.CertId == certId);

            if (existingCertificate != null)
            {
                // Update existing record
                existingCertificate.Score = score;
                existingCertificate.DateTaken = DateTime.UtcNow;
                existingCertificate.IsPassed = isPassed;
            }
            else
            {
                // Create a new record
                var userCertificate = new UserCertificate
                {
                    UserId = userId,
                    CertId = certId,
                    Score = score,
                    DateTaken = DateTime.UtcNow,
                    IsPassed = isPassed
                };

                _context.UserCertificates.Add(userCertificate);
            }

            // Save changes to the database
            await _context.SaveChangesAsync();

            return existingCertificate;
        }

        private int CalculateScore(List<int> answerIds, int certId)
        {
            var exam = _context.Certs.Include(e => e.Questions)
                .ThenInclude(q => q.AnswerOptions)
                .FirstOrDefault(e => e.CertId == certId);

            if (exam == null)
                throw new KeyNotFoundException($"Exam with CertId {certId} not found.");

            int score = 0;

            foreach (var question in exam.Questions)
            {
                var selectedAnswerId = answerIds.FirstOrDefault(a =>
                    question.AnswerOptions.Any(o => o.Id == a));

                var selectedAnswer = question.AnswerOptions.FirstOrDefault(a => a.Id == selectedAnswerId);
                if (selectedAnswer != null && selectedAnswer.IsCorrect)
                {
                    score++;
                }
            }

            return score;
        }
        public async Task<List<UserCertificate>> GetUserResultsAsync(string userId)
        {
            return await _context.UserCertificates
                                 .Where(r => r.UserId == userId)
                                 .Include(r => r.Certificate) 
                                 .OrderByDescending(r => r.DateTaken) 
                                 .ToListAsync();
        }



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
