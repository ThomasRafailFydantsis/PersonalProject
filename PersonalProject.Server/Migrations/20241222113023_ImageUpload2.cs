using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PersonalProject.Server.Migrations
{
    /// <inheritdoc />
    public partial class ImageUpload2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Image",
                table: "Certs",
                newName: "ImagePath");

            migrationBuilder.AddColumn<string>(
                name: "ProfileImagePath",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProfileImagePath",
                table: "AspNetUsers");

            migrationBuilder.RenameColumn(
                name: "ImagePath",
                table: "Certs",
                newName: "Image");
        }
    }
}
