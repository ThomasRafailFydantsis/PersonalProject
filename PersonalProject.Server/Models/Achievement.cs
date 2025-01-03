using System.ComponentModel.DataAnnotations;

namespace PersonalProject.Server.Models
{
    public class Achievement
    {
        [Key]
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int RewardCoins { get; set; } = 0;
        public string? IconPath { get; set; }
        public string UnlockCondition { get; set; } = string.Empty;
        public AchievementType Type { get; set; } = AchievementType.ExamBased; 
    }
    public enum AchievementType
    {
        ExamBased,
        FirstExamPassed,
        PassingStreak
    }

}
