using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kaeltehilfe_backend.Application.Infrastructure.Database.Migrations
{
    /// <inheritdoc />
    public partial class AddShiftRules : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ShiftRules",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Criterion = table.Column<int>(type: "INTEGER", nullable: false),
                    Threshold = table.Column<int>(type: "INTEGER", nullable: false),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false),
                    BusRegistrationNumber = table.Column<string>(type: "TEXT", nullable: true),
                    AddOn = table.Column<long>(type: "INTEGER", nullable: false, defaultValueSql: "unixepoch('now')"),
                    ChangeOn = table.Column<long>(type: "INTEGER", nullable: true, defaultValueSql: "unixepoch('now')"),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShiftRules", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ShiftRules_IsDeleted",
                table: "ShiftRules",
                column: "IsDeleted");

            // Seed the 3 global rules (matching the previously hardcoded rules)
            // Criterion: ANY_VOLUNTEER=0, FEMALE_VOLUNTEER=1, DRIVER=2
            migrationBuilder.Sql(@"
                INSERT INTO ShiftRules (Criterion, Threshold, IsActive, BusRegistrationNumber, AddOn, ChangeOn, IsDeleted)
                VALUES
                    (0, 3, 1, NULL, unixepoch('now'), unixepoch('now'), 0),
                    (1, 1, 1, NULL, unixepoch('now'), unixepoch('now'), 0),
                    (2, 1, 1, NULL, unixepoch('now'), unixepoch('now'), 0);
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ShiftRules");
        }
    }
}
