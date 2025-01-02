using System.ComponentModel.DataAnnotations;

namespace PersonalProject.Server.Models
{
    public class ExamSubmission
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string UserId { get; set; }
        public virtual ApplicationUser User { get; set; } 
        [Required]
        public int CertId { get; set; }
        public virtual Certs Certificate { get; set; }  
        public DateTime SubmissionDate { get; set; }
        public int? Score { get; set; }
        public bool IsPassed { get; set; }
        public virtual ICollection<AnswerSubmission> Answers { get; set; } = new List<AnswerSubmission>();
        public virtual ICollection<MarkerAssignment> MarkerAssignments { get; set; } = new List<MarkerAssignment>();
        public virtual ICollection<UserAchievement> EarnedAchievements { get; set; } = new List<UserAchievement>();
    }
}
