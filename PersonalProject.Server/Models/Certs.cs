using System.ComponentModel.DataAnnotations;

namespace PersonalProject.Server.Models
{
    public class Certs
    {
        [Key]
        public int CertId { get; set; }
        [Required]
        [MaxLength(255)]
        public string CertName { get; set; }
        public string? ImagePath { get; set; }
        public int PassingScore { get; set; }
        public ICollection<Question> Questions { get; set; }
        public string? Description { get; set; }
        public ICollection<Description> Descriptions { get; set; }
        public bool IsFree { get; set; }=true;
        public int Cost { get; set; } = 0;
        public int Reward { get; set; }
        public int CategoryId { get; set; }
        public virtual ExamCategory? Category { get; set; }
        public ICollection<CertAchievement> CertAchievements { get; set; } 
    }
}


