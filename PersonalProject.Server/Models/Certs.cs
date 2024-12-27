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

        // New nullable fields
        public string? Description { get; set; } // Main description
        public ICollection<Description> Descriptions { get; set; } // List of additional descriptions
    }
}


