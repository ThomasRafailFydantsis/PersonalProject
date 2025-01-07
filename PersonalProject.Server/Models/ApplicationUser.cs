using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations.Schema;
using System.Security.Claims;

namespace PersonalProject.Server.Models
{
    
    public class ApplicationUser : IdentityUser
 {
     public string? FirstName { get; set; }
     public string? LastName { get; set; }
     public string? ProfileImagePath { get; set; }
     [NotMapped]
     public ClaimsIdentity? Username { get; internal set; }
     public ICollection<UserCertificate>? UserCertificates { get; set; }
     public ICollection<UserAchievement>? UserAchievements { get; set; } = new List<UserAchievement>();
     public int PassingStreak { get; set; } = 0;
     public DateTime? LastExamDate { get; set; }
     public string? Address1 { get; set; }
     public int Coins { get; set; } = 0; 
     public int Gold { get; set; } = 0;
     public bool IsAuth { get; set; } 
    }
}
