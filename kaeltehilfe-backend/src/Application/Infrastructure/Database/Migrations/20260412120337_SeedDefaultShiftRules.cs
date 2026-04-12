using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kaeltehilfe_backend.Application.Infrastructure.Database.Migrations
{
    /// <inheritdoc />
    public partial class SeedDefaultShiftRules : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Global shift rules: no BusId means they apply to all buses.
            // Criterion values: ANY_VOLUNTEER = 0, FEMALE_VOLUNTEER = 1, DRIVER = 2
            migrationBuilder.InsertData(
                table: "ShiftRules",
                columns: ["Criterion", "Threshold", "IsActive", "IsDeleted"],
                values: new object[,]
                {
                    { 0, 3, true, false }, // Alle Freiwilligen
                    { 1, 1, true, false }, // Weibliche Freiwillige
                    { 2, 1, true, false }, // Fahrer
                }
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                "DELETE FROM ShiftRules WHERE BusId IS NULL AND Criterion IN (0, 1, 2)"
            );
        }
    }
}
