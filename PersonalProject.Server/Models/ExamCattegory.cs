using System.ComponentModel.DataAnnotations;

namespace PersonalProject.Server.Models
{
    public class ExamCategory
    {
        [Key]
        public int Id { get; set; }
        public string? Name { get; set; }
    }
}
