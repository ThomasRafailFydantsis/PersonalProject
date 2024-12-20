using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace PersonalProject.Server.Models
{
    public class UserCertificate
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; }  // Matches the ApplicationUser Id

        public virtual ApplicationUser User { get; set; }  // Navigation Property

        [Required]
        public int CertId { get; set; }

        public virtual Certs Certificate { get; set; }  // Navigation Property

        public DateTime DateAdded { get; set; } = DateTime.UtcNow;

        public int? Score { get; set; }

        public DateTime? DateTaken { get; set; }

        public bool IsPassed { get; set; } = false;  // True if the user passes the exam

        public bool IsCertificateGenerated { get; set; } = false;  // Track if a certificate has been issued

        public string? CertificateFilePath { get; set; }  // Path to the generated certificate file
    }
}
