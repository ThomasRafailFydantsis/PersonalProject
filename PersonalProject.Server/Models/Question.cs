namespace PersonalProject.Server.Models
{
    public class Question
    {
        public int Id { get; set; }
        public string Text { get; set; }
        public string CorrectAnswer { get; set; }

 
        public int CertId { get; set; }
        public virtual Certs Certs { get; set; } 

        public ICollection<AnswerOption> AnswerOptions { get; set; }
    }
}
