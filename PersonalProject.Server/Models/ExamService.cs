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
                .Include(c => c.CertAchievements)
                .ThenInclude(ca => ca.Achievement)
                .FirstOrDefaultAsync(c => c.CertId == certId);

            if (certificate == null)
                throw new KeyNotFoundException($"Certificate with ID {certId} not found.");

            var user = await _context.Users
                .Include(u => u.UserAchievements)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                throw new KeyNotFoundException($"User with ID {userId} not found.");

            int score = 0;
            var answers = new List<AnswerSubmission>();
            foreach (var answerId in answerIds)
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
                        score++;
                }
            }

            bool isPassed = score >= certificate.PassingScore;

            if (certificate.Cost > 0)
            {
                var examSubmission = new ExamSubmission
                {
                    UserId = userId,
                    CertId = certId,
                    SubmissionDate = DateTime.UtcNow,
                    Score = score,
                    IsPassed = isPassed,
                    Answers = answers
                };
                _context.ExamSubmissions.Add(examSubmission);
            }

            var existingCertificate = await _context.UserCertificates
                .FirstOrDefaultAsync(c => c.UserId == userId && c.CertId == certId);

            if (existingCertificate != null)
            {
                existingCertificate.Score = score;
                existingCertificate.DateTaken = DateTime.UtcNow;
                existingCertificate.IsPassed = isPassed;
            }
            else
            {
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

            if (isPassed)
            {
                user.Coins += certificate.Reward;
            }

            var earnedAchievements = new List<Achievement>();
            foreach (var certAchievement in certificate.CertAchievements)
            {
                if (!user.UserAchievements.Any(ua => ua.AchievementId == certAchievement.AchievementId))
                {
                    user.UserAchievements.Add(new UserAchievement
                    {
                        AchievementId = certAchievement.AchievementId,
                        UserId = userId,
                        UnlockedOn = DateTime.UtcNow
                    });

                    earnedAchievements.Add(certAchievement.Achievement);
                    user.Coins += certAchievement.Achievement.RewardCoins;
                }
            }

            await EvaluateAndAwardAchievements(user, score, isPassed);

            await _context.SaveChangesAsync();

            if (certificate.Cost == 0)
            {
                return new UserCertificate
                {
                    CertId = certId,
                    UserId = userId,
                    Score = score,
                    IsPassed = isPassed,
                    DateTaken = DateTime.UtcNow,
                    Certificate = certificate 
                };
            }

            existingCertificate.Certificate = certificate;

            return existingCertificate;
        }

       public int CalculateScore(List<int> answerIds, int certId)
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

        private async Task EvaluateAndAwardAchievements(ApplicationUser user, int score, bool isPassed)
        {
            if (!isPassed) return; 

            var achievements = new List<Achievement>();

            if (user.UserAchievements == null)
            {
                user.UserAchievements = await _context.UserAchievements
                                                      .Include(ua => ua.Achievement)
                                                      .Where(ua => ua.UserId == user.Id)
                                                      .ToListAsync();
            }

            if (!user.UserAchievements.Any(ua => ua.Achievement?.Type == AchievementType.FirstExamPassed))
            {
                var firstExamAchievement = await _context.Achievements
                                                         .FirstOrDefaultAsync(a => a.Type == AchievementType.FirstExamPassed);

                if (firstExamAchievement != null)
                {
                    achievements.Add(firstExamAchievement);
                    user.UserAchievements.Add(new UserAchievement
                    {
                        AchievementId = firstExamAchievement.Id,
                        UserId = user.Id,
                        UnlockedOn = DateTime.UtcNow
                    });

                    user.Coins += firstExamAchievement.RewardCoins; 
                }
            }

            if (user.LastExamDate.HasValue && (DateTime.UtcNow - user.LastExamDate.Value).TotalDays <= 1)
            {
                user.PassingStreak++;
            }
            else
            {
                user.PassingStreak = 1; 
            }

            var streakAchievement = await _context.Achievements
                                                  .FirstOrDefaultAsync(a =>
                                                      a.Type == AchievementType.PassingStreak &&
                                                      a.UnlockCondition == user.PassingStreak.ToString());

            if (streakAchievement != null && !user.UserAchievements.Any(ua => ua.AchievementId == streakAchievement.Id))
            {
                achievements.Add(streakAchievement);
                user.UserAchievements.Add(new UserAchievement
                {
                    AchievementId = streakAchievement.Id,
                    UserId = user.Id,
                    UnlockedOn = DateTime.UtcNow
                });

                user.Coins += streakAchievement.RewardCoins; 
            }

            user.LastExamDate = DateTime.UtcNow; 

            await _context.SaveChangesAsync();

            Console.WriteLine($"Awarded {achievements.Count} achievements to user {user.Id}");
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
