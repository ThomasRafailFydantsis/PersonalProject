using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations.Schema;
using System.Security.Claims;

namespace PersonalProject.Server.Models
{
    public class ApplicationUser : IdentityUser
    {
        [NotMapped]
        public ClaimsIdentity? Username { get; internal set; }
    }
}
