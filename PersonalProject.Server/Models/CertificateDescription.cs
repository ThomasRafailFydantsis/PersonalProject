using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PersonalProject.Server.Models
{
    public class CertificateDescription
    {
        [Key]
        public int DescriptionId { get; set; }
        public string? Description { get; set; }
        [ForeignKey("CertId")]
        public int CertId { get; set; }
        public virtual Certs Certs { get; set; }

    }
}
