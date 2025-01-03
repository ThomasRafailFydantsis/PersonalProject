using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PersonalProject.Server.Migrations
{
    /// <inheritdoc />
    public partial class AchievementsAddd : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Certs_ExamCategory_CategoryId",
                table: "Certs");

            migrationBuilder.AlterColumn<int>(
                name: "CategoryId",
                table: "Certs",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Certs_ExamCategory_CategoryId",
                table: "Certs",
                column: "CategoryId",
                principalTable: "ExamCategory",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Certs_ExamCategory_CategoryId",
                table: "Certs");

            migrationBuilder.AlterColumn<int>(
                name: "CategoryId",
                table: "Certs",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddForeignKey(
                name: "FK_Certs_ExamCategory_CategoryId",
                table: "Certs",
                column: "CategoryId",
                principalTable: "ExamCategory",
                principalColumn: "Id");
        }
    }
}
