using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace PersonalProject.Server.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CertsData",
                columns: table => new
                {
                    CertId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CertName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Key = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CertsData", x => x.CertId);
                });

            migrationBuilder.InsertData(
                table: "CertsData",
                columns: new[] { "CertId", "CertName", "Key" },
                values: new object[,]
                {
                    { 1, "Sql", "one" },
                    { 2, "Sql", "one" },
                    { 3, "Sql", "one" },
                    { 4, "Sql", "one" },
                    { 5, "Sql", "one" },
                    { 6, "Sql", "one" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CertsData");
        }
    }
}
