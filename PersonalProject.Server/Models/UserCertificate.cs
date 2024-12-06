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

        [ForeignKey(nameof(UserId))]
        public ApplicationUser User { get; set; } 

        [Required]
        public int CertId { get; set; } 

        [ForeignKey(nameof(CertId))]
        public Certs Certificate { get; set; } 

        public DateTime DateAdded { get; set; } = DateTime.UtcNow; 
    }
}
