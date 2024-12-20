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
        public string? Description { get; set; }
        public string? Image { get; set; }
        public int PassingScore { get; set; }
        public ICollection<Question> Questions { get; set; }
    }
}


