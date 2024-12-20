using System.ComponentModel.DataAnnotations;

namespace PersonalProject.Server.Models
{
    public class AnswerSubmission
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int QuestionId { get; set; }

        public virtual Question Question { get; set; }  // Navigation Property

        [Required]
        public int SelectedAnswerId { get; set; }

        public bool IsCorrect { get; set; }

        [Required]
        public int ExamSubmissionId { get; set; }

        public virtual ExamSubmission ExamSubmission { get; set; }  // Navigation Property
    }
}
