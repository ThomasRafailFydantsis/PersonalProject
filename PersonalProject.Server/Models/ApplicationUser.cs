using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations.Schema;
using System.Security.Claims;

namespace PersonalProject.Server.Models
{
    
    public class ApplicationUser : IdentityUser
 {
     public string? FirstName { get; set; }
     public string? LastName { get; set; }
     [NotMapped]
     public ClaimsIdentity? Username { get; internal set; }
     public ICollection<UserCertificate>? UserCertificates { get; set; }
    
 }
}
