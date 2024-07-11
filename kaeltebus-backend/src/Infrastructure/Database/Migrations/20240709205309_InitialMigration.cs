using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace kaeltebus_backend.Infrastructure.Database.Migrations
{
    /// <inheritdoc />
    public partial class InitialMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Clients",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Gender = table.Column<int>(type: "INTEGER", nullable: false),
                    ApproxAge = table.Column<int>(type: "INTEGER", nullable: false),
                    AddOn = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "datetime()"),
                    ChangeOn = table.Column<DateTime>(type: "TEXT", nullable: true, defaultValueSql: "datetime()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Clients", x => x.Id);
                    table.UniqueConstraint("AK_Clients_Name", x => x.Name);
                });

            migrationBuilder.CreateTable(
                name: "Goods",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    GoodType = table.Column<int>(type: "INTEGER", nullable: false),
                    Tags = table.Column<string>(type: "TEXT", nullable: false),
                    AddOn = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "datetime()"),
                    ChangeOn = table.Column<DateTime>(type: "TEXT", nullable: true, defaultValueSql: "datetime()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Goods", x => x.Id);
                    table.UniqueConstraint("AK_Goods_Name", x => x.Name);
                });

            migrationBuilder.CreateTable(
                name: "Shifts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Date = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    AddOn = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "datetime()"),
                    ChangeOn = table.Column<DateTime>(type: "TEXT", nullable: true, defaultValueSql: "datetime()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Shifts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Volunteers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Firstname = table.Column<string>(type: "TEXT", nullable: false),
                    Lastname = table.Column<string>(type: "TEXT", nullable: false),
                    Gender = table.Column<int>(type: "INTEGER", nullable: false),
                    IsDriver = table.Column<bool>(type: "INTEGER", nullable: false),
                    AddOn = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "datetime()"),
                    ChangeOn = table.Column<DateTime>(type: "TEXT", nullable: true, defaultValueSql: "datetime()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Volunteers", x => x.Id);
                    table.UniqueConstraint("AK_Volunteers_Firstname_Lastname", x => new { x.Firstname, x.Lastname });
                });

            migrationBuilder.CreateTable(
                name: "Distributions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ShiftId = table.Column<int>(type: "INTEGER", nullable: false),
                    ClientId = table.Column<int>(type: "INTEGER", nullable: false),
                    GoodId = table.Column<int>(type: "INTEGER", nullable: false),
                    Quantity = table.Column<int>(type: "INTEGER", nullable: false),
                    AddOn = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "datetime()"),
                    ChangeOn = table.Column<DateTime>(type: "TEXT", nullable: true, defaultValueSql: "datetime()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Distributions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Distributions_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Distributions_Goods_GoodId",
                        column: x => x.GoodId,
                        principalTable: "Goods",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Distributions_Shifts_ShiftId",
                        column: x => x.ShiftId,
                        principalTable: "Shifts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "ShiftVolunteer",
                columns: table => new
                {
                    ShiftId = table.Column<int>(type: "INTEGER", nullable: false),
                    VolunteerId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShiftVolunteer", x => new { x.ShiftId, x.VolunteerId });
                    table.ForeignKey(
                        name: "FK_ShiftVolunteer_Shifts_ShiftId",
                        column: x => x.ShiftId,
                        principalTable: "Shifts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ShiftVolunteer_Volunteers_VolunteerId",
                        column: x => x.VolunteerId,
                        principalTable: "Volunteers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.InsertData(
                table: "Clients",
                columns: new[] { "Id", "AddOn", "ApproxAge", "Gender", "Name" },
                values: new object[,]
                {
                    { 1, new DateTime(2024, 7, 9, 22, 53, 8, 565, DateTimeKind.Local).AddTicks(2875), 45, 0, "Martin" },
                    { 2, new DateTime(2024, 7, 9, 22, 53, 8, 565, DateTimeKind.Local).AddTicks(2881), 40, 1, "Martina" },
                    { 3, new DateTime(2024, 7, 9, 22, 53, 8, 565, DateTimeKind.Local).AddTicks(2885), 30, 0, "Tim" }
                });

            migrationBuilder.InsertData(
                table: "Goods",
                columns: new[] { "Id", "AddOn", "Description", "GoodType", "Name", "Tags" },
                values: new object[,]
                {
                    { 1, new DateTime(2024, 7, 9, 0, 0, 0, 0, DateTimeKind.Local), "", 2, "Suppe", "[]" },
                    { 2, new DateTime(2024, 7, 9, 0, 0, 0, 0, DateTimeKind.Local), "", 2, "Kaffee", "[]" },
                    { 3, new DateTime(2024, 7, 9, 0, 0, 0, 0, DateTimeKind.Local), "", 2, "Tee", "[]" },
                    { 4, new DateTime(2024, 7, 9, 0, 0, 0, 0, DateTimeKind.Local), "", 1, "Decke", "[]" },
                    { 5, new DateTime(2024, 7, 9, 0, 0, 0, 0, DateTimeKind.Local), "", 1, "Socken", "[]" },
                    { 6, new DateTime(2024, 7, 9, 0, 0, 0, 0, DateTimeKind.Local), "", 0, "Tempos", "[]" },
                    { 7, new DateTime(2024, 7, 9, 0, 0, 0, 0, DateTimeKind.Local), "", 0, "Deo", "[]" }
                });

            migrationBuilder.InsertData(
                table: "Shifts",
                columns: new[] { "Id", "AddOn", "Date" },
                values: new object[] { 1, new DateTime(2024, 7, 9, 22, 53, 8, 565, DateTimeKind.Local).AddTicks(2798), new DateOnly(2024, 7, 9) });

            migrationBuilder.InsertData(
                table: "Volunteers",
                columns: new[] { "Id", "Firstname", "Gender", "IsDriver", "Lastname" },
                values: new object[,]
                {
                    { 1, "Luka", 0, false, "Weis" },
                    { 2, "Peter", 0, false, "Pan" },
                    { 3, "Max", 0, false, "Mustermann" }
                });

            migrationBuilder.InsertData(
                table: "Distributions",
                columns: new[] { "Id", "AddOn", "ClientId", "GoodId", "Quantity", "ShiftId" },
                values: new object[,]
                {
                    { 1, new DateTime(2024, 7, 9, 22, 53, 8, 565, DateTimeKind.Local).AddTicks(2937), 1, 1, 1, 1 },
                    { 2, new DateTime(2024, 7, 9, 22, 53, 8, 565, DateTimeKind.Local).AddTicks(2943), 1, 2, 2, 1 },
                    { 3, new DateTime(2024, 7, 9, 22, 53, 8, 565, DateTimeKind.Local).AddTicks(2947), 1, 4, 1, 1 },
                    { 4, new DateTime(2024, 7, 9, 22, 53, 8, 565, DateTimeKind.Local).AddTicks(2950), 2, 2, 1, 1 },
                    { 5, new DateTime(2024, 7, 9, 22, 53, 8, 565, DateTimeKind.Local).AddTicks(2954), 3, 1, 1, 1 },
                    { 6, new DateTime(2024, 7, 9, 22, 53, 8, 565, DateTimeKind.Local).AddTicks(2956), 3, 3, 2, 1 },
                    { 7, new DateTime(2024, 7, 9, 22, 53, 8, 565, DateTimeKind.Local).AddTicks(2959), 3, 7, 1, 1 }
                });

            migrationBuilder.InsertData(
                table: "ShiftVolunteer",
                columns: new[] { "ShiftId", "VolunteerId" },
                values: new object[] { 1, 1 });

            migrationBuilder.CreateIndex(
                name: "IX_Distributions_ClientId",
                table: "Distributions",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_Distributions_GoodId",
                table: "Distributions",
                column: "GoodId");

            migrationBuilder.CreateIndex(
                name: "IX_Distributions_ShiftId",
                table: "Distributions",
                column: "ShiftId");

            migrationBuilder.CreateIndex(
                name: "IX_ShiftVolunteer_VolunteerId",
                table: "ShiftVolunteer",
                column: "VolunteerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Distributions");

            migrationBuilder.DropTable(
                name: "ShiftVolunteer");

            migrationBuilder.DropTable(
                name: "Clients");

            migrationBuilder.DropTable(
                name: "Goods");

            migrationBuilder.DropTable(
                name: "Shifts");

            migrationBuilder.DropTable(
                name: "Volunteers");
        }
    }
}
