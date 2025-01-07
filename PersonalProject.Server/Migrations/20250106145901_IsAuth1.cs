using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PersonalProject.Server.Migrations
{
    /// <inheritdoc />
    public partial class IsAuth1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsAuth",
                table: "AspNetUsers",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsAuth",
                table: "AspNetUsers");
        }
    }
}
