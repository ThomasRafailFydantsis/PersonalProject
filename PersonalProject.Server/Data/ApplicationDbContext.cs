using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PersonalProject.Server.Models;
using System.Reflection.Emit;
using System.Security.Claims;

namespace PersonalProject.Server.Data{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<Certs> Certs { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<AnswerOption> AnswerOptions { get; set; }
        public DbSet<UserCertificate> UserCertificates { get; set; }
        public DbSet<ExamSubmission> ExamSubmissions { get; set; }
        public DbSet<AnswerSubmission> AnswerSubmissions { get; set; }
        public DbSet<MarkerAssignment> MarkerAssignments { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Certs Configuration
            builder.Entity<Certs>(entity =>
            {
                entity.HasKey(c => c.CertId);
                entity.Property(c => c.CertName)
                      .IsRequired()
                      .HasMaxLength(255);

                entity.HasMany(c => c.Questions)
                      .WithOne(q => q.Certs)
                      .HasForeignKey(q => q.CertId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Questions Configuration
            builder.Entity<Question>(entity =>
            {
                entity.HasKey(q => q.Id);

                entity.HasMany(q => q.AnswerOptions)
                      .WithOne(a => a.Question)
                      .HasForeignKey(a => a.QuestionId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // UserCertificate Configuration
            builder.Entity<UserCertificate>(entity =>
            {
                entity.HasKey(uc => uc.Id);

                entity.HasOne(uc => uc.User)
                      .WithMany(u => u.UserCertificates)
                      .HasForeignKey(uc => uc.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(uc => uc.Certificate)
                      .WithMany()
                      .HasForeignKey(uc => uc.CertId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(uc => new { uc.UserId, uc.CertId }).IsUnique();
            });

            // ExamSubmission Configuration
            builder.Entity<ExamSubmission>(entity =>
            {
                entity.HasKey(es => es.Id);

                entity.HasOne(es => es.User)
                      .WithMany()
                      .HasForeignKey(es => es.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(es => es.Certificate)
                      .WithMany()
                      .HasForeignKey(es => es.CertId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasMany(es => es.Answers)
                      .WithOne(a => a.ExamSubmission)
                      .HasForeignKey(a => a.ExamSubmissionId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.Property(es => es.IsPassed)
                      .HasDefaultValue(false);

                entity.Property(es => es.SubmissionDate)
                      .HasDefaultValueSql("GETUTCDATE()");
            });

            // MarkerAssignment Configuration
            builder.Entity<MarkerAssignment>(entity =>
            {
                entity.HasKey(ma => ma.Id);

                entity.HasOne(ma => ma.ExamSubmission)
                      .WithMany(es => es.MarkerAssignments) // Define the relationship
                      .HasForeignKey(ma => ma.ExamSubmissionId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(ma => ma.Marker)
                      .WithMany()
                      .HasForeignKey(ma => ma.MarkerId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            builder.Entity<AnswerSubmission>(entity =>
            {
                // Primary Key
                entity.HasKey(asm => asm.Id);

                // Foreign Key to Question
                entity.HasOne(asm => asm.Question)
                      .WithMany()
                      .HasForeignKey(asm => asm.QuestionId)
                      .OnDelete(DeleteBehavior.Restrict);

                // Foreign Key to ExamSubmission
                entity.HasOne(asm => asm.ExamSubmission)
                      .WithMany(es => es.Answers)
                      .HasForeignKey(asm => asm.ExamSubmissionId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}