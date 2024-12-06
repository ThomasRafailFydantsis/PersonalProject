using System.ComponentModel.DataAnnotations;

namespace PersonalProject.Server.Models
{
    public class Certs
    {
        [Key]
        public int CertId { get; set; }
        public string? CertName { get; set; }
        public string? Description { get; set; }
        public string? Image { get; set; }

    }
}
