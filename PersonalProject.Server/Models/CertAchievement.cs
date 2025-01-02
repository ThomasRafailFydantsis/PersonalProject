using System.ComponentModel.DataAnnotations;

namespace PersonalProject.Server.Models
{
    public class CertAchievement
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int CertId { get; set; }
        public virtual Certs Cert { get; set; }

        [Required]
        public int AchievementId { get; set; }
        public virtual Achievement Achievement { get; set; }
    }
}
