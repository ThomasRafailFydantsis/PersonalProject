using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PersonalProject.Server.Migrations
{
    /// <inheritdoc />
    public partial class AchievementsAdd : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "LastExamDate",
                table: "AspNetUsers",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PassingStreak",
                table: "AspNetUsers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "Achievements",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LastExamDate",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "PassingStreak",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Achievements");
        }
    }
}
