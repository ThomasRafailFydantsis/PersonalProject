using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace PersonalProject.Server.Models
{
    public class UserCertificate
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; }  

        public virtual ApplicationUser User { get; set; }  

        [Required]
        public int CertId { get; set; }

        public virtual Certs Certificate { get; set; } 

        public DateTime DateAdded { get; set; } = DateTime.UtcNow;

        public int? Score { get; set; }

        public DateTime? DateTaken { get; set; }

        public bool IsPassed { get; set; } = false;  

        public bool IsCertificateGenerated { get; set; } = false;  

        public string? CertificateFilePath { get; set; } 
        public bool? LastExamPassed { get; set; }
       
    }
}
