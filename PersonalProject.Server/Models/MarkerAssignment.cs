using System.ComponentModel.DataAnnotations;

namespace PersonalProject.Server.Models
{
    public class MarkerAssignment
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ExamSubmissionId { get; set; }

        public virtual ExamSubmission ExamSubmission { get; set; }  

        [Required]
        public string MarkerId { get; set; }  

        public virtual ApplicationUser Marker { get; set; }  

        public bool IsMarked { get; set; } = false;  

        public DateTime AssignedDate { get; set; } = DateTime.UtcNow;
    }
}
