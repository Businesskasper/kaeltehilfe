using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kaeltehilfe_backend.Application.Infrastructure.Database.Migrations
{
    /// <inheritdoc />
    public partial class RefactorShiftRuleBusFK : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BusRegistrationNumber",
                table: "ShiftRules");

            migrationBuilder.AddColumn<int>(
                name: "BusId",
                table: "ShiftRules",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ShiftRules_BusId",
                table: "ShiftRules",
                column: "BusId");

            migrationBuilder.AddForeignKey(
                name: "FK_ShiftRules_Busses_BusId",
                table: "ShiftRules",
                column: "BusId",
                principalTable: "Busses",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ShiftRules_Busses_BusId",
                table: "ShiftRules");

            migrationBuilder.DropIndex(
                name: "IX_ShiftRules_BusId",
                table: "ShiftRules");

            migrationBuilder.DropColumn(
                name: "BusId",
                table: "ShiftRules");

            migrationBuilder.AddColumn<string>(
                name: "BusRegistrationNumber",
                table: "ShiftRules",
                type: "TEXT",
                nullable: true);
        }
    }
}
