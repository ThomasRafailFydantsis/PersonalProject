using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PersonalProject.Server.Migrations
{
    /// <inheritdoc />
    public partial class InitialMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_CertsData",
                table: "CertsData");

            migrationBuilder.RenameTable(
                name: "CertsData",
                newName: "Certs");

            migrationBuilder.RenameColumn(
                name: "Key",
                table: "Certs",
                newName: "Image");

            migrationBuilder.AddColumn<string>(
                name: "FirstName",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastName",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CertName",
                table: "Certs",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Certs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Certs",
                table: "Certs",
                column: "CertId");

            migrationBuilder.CreateTable(
                name: "UserCertificates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CertId = table.Column<int>(type: "int", nullable: false),
                    DateAdded = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserCertificates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserCertificates_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserCertificates_Certs_CertId",
                        column: x => x.CertId,
                        principalTable: "Certs",
                        principalColumn: "CertId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserCertificates_CertId",
                table: "UserCertificates",
                column: "CertId");

            migrationBuilder.CreateIndex(
                name: "IX_UserCertificates_UserId_CertId",
                table: "UserCertificates",
                columns: new[] { "UserId", "CertId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserCertificates");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Certs",
                table: "Certs");

            migrationBuilder.DropColumn(
                name: "FirstName",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "LastName",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Certs");

            migrationBuilder.RenameTable(
                name: "Certs",
                newName: "CertsData");

            migrationBuilder.RenameColumn(
                name: "Image",
                table: "CertsData",
                newName: "Key");

            migrationBuilder.AlterColumn<string>(
                name: "CertName",
                table: "CertsData",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255);

            migrationBuilder.AddPrimaryKey(
                name: "PK_CertsData",
                table: "CertsData",
                column: "CertId");
        }
    }
}
