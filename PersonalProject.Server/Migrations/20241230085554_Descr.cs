using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PersonalProject.Server.Migrations
{
    /// <inheritdoc />
    public partial class Descr : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Description_Certs_CertId",
                table: "Description");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Description",
                table: "Description");

            migrationBuilder.RenameTable(
                name: "Description",
                newName: "Descriptions");

            migrationBuilder.RenameIndex(
                name: "IX_Description_CertId",
                table: "Descriptions",
                newName: "IX_Descriptions_CertId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Descriptions",
                table: "Descriptions",
                column: "DescriptionId");

            migrationBuilder.AddForeignKey(
                name: "FK_Descriptions_Certs_CertId",
                table: "Descriptions",
                column: "CertId",
                principalTable: "Certs",
                principalColumn: "CertId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Descriptions_Certs_CertId",
                table: "Descriptions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Descriptions",
                table: "Descriptions");

            migrationBuilder.RenameTable(
                name: "Descriptions",
                newName: "Description");

            migrationBuilder.RenameIndex(
                name: "IX_Descriptions_CertId",
                table: "Description",
                newName: "IX_Description_CertId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Description",
                table: "Description",
                column: "DescriptionId");

            migrationBuilder.AddForeignKey(
                name: "FK_Description_Certs_CertId",
                table: "Description",
                column: "CertId",
                principalTable: "Certs",
                principalColumn: "CertId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
