using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PersonalProject.Server.Models;
using System.Reflection.Emit;
using System.Security.Claims;

namespace PersonalProject.Server.Data
{
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
        public DbSet<Description> Descriptions { get; set; }
        public DbSet<Achievement> Achievements { get; set; }
        public DbSet<UserAchievement> UserAchievements { get; set; }
        public DbSet<ExamCategory> ExamCategory { get; set; } = default!;

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

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

                entity.HasMany(c => c.Descriptions)
                      .WithOne(d => d.Cert)
                      .HasForeignKey(d => d.CertId);
            });

            builder.Entity<Question>(entity =>
            {
                entity.HasKey(q => q.Id);

                entity.HasMany(q => q.AnswerOptions)
                      .WithOne(a => a.Question)
                      .HasForeignKey(a => a.QuestionId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

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

            builder.Entity<MarkerAssignment>(entity =>
            {
                entity.HasKey(ma => ma.Id);

                entity.HasOne(ma => ma.ExamSubmission)
                      .WithMany(es => es.MarkerAssignments)
                      .HasForeignKey(ma => ma.ExamSubmissionId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(ma => ma.Marker)
                      .WithMany()
                      .HasForeignKey(ma => ma.MarkerId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            
            builder.Entity<AnswerSubmission>(entity =>
            {
                entity.HasKey(asm => asm.Id);

                entity.HasOne(asm => asm.Question)
                      .WithMany()
                      .HasForeignKey(asm => asm.QuestionId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(asm => asm.ExamSubmission)
                      .WithMany(es => es.Answers)
                      .HasForeignKey(asm => asm.ExamSubmissionId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

           
            builder.Entity<UserAchievement>(entity =>
            {
                entity.HasKey(ua => ua.Id);

                entity.HasOne(ua => ua.User)
                      .WithMany(u => u.UserAchievements)
                      .HasForeignKey(ua => ua.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(ua => ua.Achievement)
                      .WithMany()
                      .HasForeignKey(ua => ua.AchievementId)
                      .OnDelete(DeleteBehavior.Restrict);
            });
            builder.Entity<CertAchievement>(entity =>
            {
                entity.HasKey(ca => ca.Id);

                entity.HasOne(ca => ca.Cert)
                      .WithMany(c => c.CertAchievements)
                      .HasForeignKey(ca => ca.CertId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(ca => ca.Achievement)
                      .WithMany()
                      .HasForeignKey(ca => ca.AchievementId)
                      .OnDelete(DeleteBehavior.Restrict);
            });
            builder.Entity<UserAchievement>()
                      .HasOne(ua => ua.Achievement)
                      .WithMany()
                      .HasForeignKey(ua => ua.AchievementId)
                      .OnDelete(DeleteBehavior.Cascade);
        }
        
    }
}