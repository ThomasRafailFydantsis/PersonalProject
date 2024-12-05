﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using PersonalProject.Server.Data;

#nullable disable

namespace PersonalProject.Server.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20241130201152_InitialCreate")]
    partial class InitialCreate
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.11")
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);

            modelBuilder.Entity("PersonalProject.Server.Models.Certs", b =>
                {
                    b.Property<int?>("CertId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int?>("CertId"));

                    b.Property<string>("CertName")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Key")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("CertId");

                    b.ToTable("CertsData");

                    b.HasData(
                        new
                        {
                            CertId = 1,
                            CertName = "Sql",
                            Key = "one"
                        },
                        new
                        {
                            CertId = 2,
                            CertName = "Sql",
                            Key = "one"
                        },
                        new
                        {
                            CertId = 3,
                            CertName = "Sql",
                            Key = "one"
                        },
                        new
                        {
                            CertId = 4,
                            CertName = "Sql",
                            Key = "one"
                        },
                        new
                        {
                            CertId = 5,
                            CertName = "Sql",
                            Key = "one"
                        },
                        new
                        {
                            CertId = 6,
                            CertName = "Sql",
                            Key = "one"
                        });
                });
#pragma warning restore 612, 618
        }
    }
}