using System.ComponentModel.DataAnnotations;

namespace PersonalProject.Server.Models
{
    public class UserAchievement
    {
        [Key]
        public int Id { get; set; }

        public string UserId { get; set; }
        public ApplicationUser User { get; set; }

        public int AchievementId { get; set; }
        public Achievement Achievement { get; set; }

        public DateTime UnlockedOn { get; set; } = DateTime.UtcNow;
    }
}
