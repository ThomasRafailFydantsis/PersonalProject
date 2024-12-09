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

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<Certs>(entity =>
            {

                entity.HasKey(c => c.CertId);
                entity.Property(c => c.CertName)
                      .IsRequired()
                      .HasMaxLength(255);
            });


            builder.Entity<UserCertificate>(entity =>
            {
                entity.HasKey(uc => uc.Id);

                entity.HasOne(uc => uc.User)
                      .WithMany(u => u.UserCertificates)
                      .HasForeignKey(uc => uc.UserId)
                      .OnDelete(DeleteBehavior.Cascade)
                      .IsRequired();

                entity.HasOne(uc => uc.Certificate)
                      .WithMany()
                      .HasForeignKey(uc => uc.CertId)
                      .OnDelete(DeleteBehavior.Restrict)
                      .IsRequired();

                entity.HasIndex(uc => new { uc.UserId, uc.CertId }).IsUnique();
           

                entity.HasOne(uc => uc.Certificate)
                      .WithMany()
                      .HasForeignKey(uc => uc.CertId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<Certs>()
                      .HasMany(e => e.Questions)
                      .WithOne(q => q.Certs)
                      .HasForeignKey(q => q.CertId)
                      .OnDelete(DeleteBehavior.Cascade);
          
            builder.Entity<Question>()
                      .HasMany(q => q.AnswerOptions)
                      .WithOne(a => a.Question)
                      .HasForeignKey(a => a.QuestionId)
                      .OnDelete(DeleteBehavior.Cascade);
        } 
    }
}