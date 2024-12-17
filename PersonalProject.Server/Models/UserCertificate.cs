using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace PersonalProject.Server.Models
{
    public class UserCertificate
 {
     [Key]
     public int Id { get; set; }

     [Required]
     public string UserId { get; set; }  // This should be a string to match the IdentityUser Id

     public virtual ApplicationUser User { get; set; }  // Navigation Property to ApplicationUser

     [Required]
     public int CertId { get; set; }
    
     public virtual Certs Certificate { get; set; }

     public DateTime DateAdded { get; set; } = DateTime.UtcNow;
    
     public int? Score { get; set; }
     public DateTime? DateTaken { get; set; }

     
 }
}
