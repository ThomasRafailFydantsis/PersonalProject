using System.ComponentModel.DataAnnotations;

namespace PersonalProject.Server.Models
{
    public class Description
    {
        [Key]
        public int DescriptionId { get; set; }

      
        [MaxLength(500)]
        public string? Text1 { get; set; }

        
        [MaxLength(500)]
        public string? Text2 { get; set; }

     
        [MaxLength(500)]
        public string? Text3 { get; set; }

        [Required]
        public int CertId { get; set; } 

        public Certs Cert { get; set; } 
    }
}
