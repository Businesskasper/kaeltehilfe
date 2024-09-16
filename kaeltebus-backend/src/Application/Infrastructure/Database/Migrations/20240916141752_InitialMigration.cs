using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace kaeltebus_backend.Application.Infrastructure.Database.Migrations
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
                    Remarks = table.Column<string>(type: "TEXT", nullable: false),
                    AddOn = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "datetime()"),
                    ChangeOn = table.Column<DateTime>(type: "TEXT", nullable: true, defaultValueSql: "datetime()"),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Clients", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Devices",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    RegistrationNumber = table.Column<string>(type: "TEXT", nullable: false),
                    AddOn = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "datetime()"),
                    ChangeOn = table.Column<DateTime>(type: "TEXT", nullable: true, defaultValueSql: "datetime()"),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Devices", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Goods",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    Tags = table.Column<string>(type: "TEXT", nullable: false),
                    GoodType = table.Column<int>(type: "INTEGER", nullable: false),
                    AddOn = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "datetime()"),
                    ChangeOn = table.Column<DateTime>(type: "TEXT", nullable: true, defaultValueSql: "datetime()"),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Goods", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Location",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    AddOn = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "datetime()"),
                    ChangeOn = table.Column<DateTime>(type: "TEXT", nullable: true, defaultValueSql: "datetime()"),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Location", x => x.Id);
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
                    Remarks = table.Column<string>(type: "TEXT", nullable: false),
                    AddOn = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "datetime()"),
                    ChangeOn = table.Column<DateTime>(type: "TEXT", nullable: true, defaultValueSql: "datetime()"),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Volunteers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Shifts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    DeviceId = table.Column<int>(type: "INTEGER", nullable: false),
                    Date = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    AddOn = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "datetime()"),
                    ChangeOn = table.Column<DateTime>(type: "TEXT", nullable: true, defaultValueSql: "datetime()"),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Shifts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Shifts_Devices_DeviceId",
                        column: x => x.DeviceId,
                        principalTable: "Devices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Distributions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    DeviceId = table.Column<int>(type: "INTEGER", nullable: false),
                    ClientId = table.Column<int>(type: "INTEGER", nullable: false),
                    GoodId = table.Column<int>(type: "INTEGER", nullable: false),
                    LocationId = table.Column<int>(type: "INTEGER", nullable: false),
                    Quantity = table.Column<int>(type: "INTEGER", nullable: false),
                    AddOn = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "datetime()"),
                    ChangeOn = table.Column<DateTime>(type: "TEXT", nullable: true, defaultValueSql: "datetime()"),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Distributions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Distributions_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Distributions_Devices_DeviceId",
                        column: x => x.DeviceId,
                        principalTable: "Devices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Distributions_Goods_GoodId",
                        column: x => x.GoodId,
                        principalTable: "Goods",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Distributions_Location_LocationId",
                        column: x => x.LocationId,
                        principalTable: "Location",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ShiftVolunteers",
                columns: table => new
                {
                    ShiftId = table.Column<int>(type: "INTEGER", nullable: false),
                    VolunteerId = table.Column<int>(type: "INTEGER", nullable: false),
                    Order = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShiftVolunteers", x => new { x.ShiftId, x.VolunteerId });
                    table.ForeignKey(
                        name: "FK_ShiftVolunteers_Shifts_ShiftId",
                        column: x => x.ShiftId,
                        principalTable: "Shifts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ShiftVolunteers_Volunteers_VolunteerId",
                        column: x => x.VolunteerId,
                        principalTable: "Volunteers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Clients",
                columns: new[] { "Id", "AddOn", "ApproxAge", "Gender", "Name", "Remarks" },
                values: new object[,]
                {
                    { 1, new DateTime(2024, 9, 16, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7235), 45, 0, "Martin", "" },
                    { 2, new DateTime(2024, 9, 16, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7241), 40, 1, "Martina", "" },
                    { 3, new DateTime(2024, 9, 16, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7243), 30, 0, "Tim", "" }
                });

            migrationBuilder.InsertData(
                table: "Devices",
                columns: new[] { "Id", "AddOn", "RegistrationNumber" },
                values: new object[] { 1, new DateTime(2024, 9, 16, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7066), "UL-RK1013" });

            migrationBuilder.InsertData(
                table: "Goods",
                columns: new[] { "Id", "AddOn", "Description", "GoodType", "Name", "Tags" },
                values: new object[,]
                {
                    { 1, new DateTime(2024, 9, 16, 0, 0, 0, 0, DateTimeKind.Local), "", 2, "Suppe", "[]" },
                    { 2, new DateTime(2024, 9, 16, 0, 0, 0, 0, DateTimeKind.Local), "", 2, "Kaffee", "[]" },
                    { 3, new DateTime(2024, 9, 16, 0, 0, 0, 0, DateTimeKind.Local), "", 2, "Tee", "[]" },
                    { 4, new DateTime(2024, 9, 16, 0, 0, 0, 0, DateTimeKind.Local), "", 1, "Decke", "[]" },
                    { 5, new DateTime(2024, 9, 16, 0, 0, 0, 0, DateTimeKind.Local), "", 1, "Socken", "[]" },
                    { 6, new DateTime(2024, 9, 16, 0, 0, 0, 0, DateTimeKind.Local), "", 0, "Tempos", "[]" },
                    { 7, new DateTime(2024, 9, 16, 0, 0, 0, 0, DateTimeKind.Local), "", 0, "Deo", "[]" }
                });

            migrationBuilder.InsertData(
                table: "Location",
                columns: new[] { "Id", "AddOn", "Name" },
                values: new object[,]
                {
                    { 1, new DateTime(2024, 9, 16, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7270), "Alter Friedhof" },
                    { 2, new DateTime(2024, 9, 16, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7274), "Bahnhof" },
                    { 3, new DateTime(2024, 9, 16, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7277), "Neue Mitte" },
                    { 4, new DateTime(2024, 9, 16, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7279), "Hirschstraße" },
                    { 5, new DateTime(2024, 9, 16, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7282), "Schillerstraße" }
                });

            migrationBuilder.InsertData(
                table: "Volunteers",
                columns: new[] { "Id", "AddOn", "Firstname", "Gender", "IsDriver", "Lastname", "Remarks" },
                values: new object[,]
                {
                    { 1, new DateTime(2024, 9, 16, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7024), "Luka", 0, false, "Weis", "" },
                    { 2, new DateTime(2024, 9, 16, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7029), "Peter", 0, true, "Pan", "" },
                    { 3, new DateTime(2024, 9, 16, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7032), "Max", 0, false, "Mustermann", "" },
                    { 4, new DateTime(2024, 9, 16, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7035), "Corinna", 1, true, "Braun", "" }
                });

            migrationBuilder.InsertData(
                table: "Distributions",
                columns: new[] { "Id", "AddOn", "ClientId", "DeviceId", "GoodId", "LocationId", "Quantity" },
                values: new object[,]
                {
                    { 1, new DateTime(2024, 9, 6, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 3, 1, 4, 4, 2 },
                    { 2, new DateTime(2024, 9, 6, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 3, 1, 2, 1, 0 },
                    { 3, new DateTime(2024, 9, 6, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 1, 1, 2, 4, 1 },
                    { 4, new DateTime(2024, 9, 6, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 2, 1, 3, 3, 0 },
                    { 5, new DateTime(2024, 9, 6, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 3, 1, 6, 4, 1 },
                    { 6, new DateTime(2024, 9, 6, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 3, 1, 2, 3, 2 },
                    { 7, new DateTime(2024, 9, 6, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 3, 1, 6, 3, 1 },
                    { 8, new DateTime(2024, 9, 6, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 2, 1, 3, 1, 2 },
                    { 9, new DateTime(2024, 9, 6, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 1, 1, 1, 3, 1 },
                    { 10, new DateTime(2024, 9, 7, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 3, 1, 4, 5, 2 },
                    { 11, new DateTime(2024, 9, 7, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 2, 1, 5, 4, 0 },
                    { 12, new DateTime(2024, 9, 7, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 1, 1, 5, 5, 1 },
                    { 13, new DateTime(2024, 9, 7, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 1, 1, 7, 2, 1 },
                    { 14, new DateTime(2024, 9, 7, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 3, 1, 3, 5, 0 },
                    { 15, new DateTime(2024, 9, 7, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 2, 1, 7, 5, 0 },
                    { 16, new DateTime(2024, 9, 7, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 2, 1, 3, 3, 1 },
                    { 17, new DateTime(2024, 9, 7, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 1, 1, 2, 2, 0 },
                    { 18, new DateTime(2024, 9, 7, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 2, 1, 2, 2, 1 },
                    { 19, new DateTime(2024, 9, 8, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 1, 1, 4, 1, 1 },
                    { 20, new DateTime(2024, 9, 8, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 3, 1, 3, 4, 0 },
                    { 21, new DateTime(2024, 9, 9, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 2, 1, 7, 2, 0 },
                    { 22, new DateTime(2024, 9, 9, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 2, 1, 5, 1, 0 },
                    { 23, new DateTime(2024, 9, 9, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 1, 1, 2, 5, 2 },
                    { 24, new DateTime(2024, 9, 9, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 1, 1, 7, 1, 1 },
                    { 25, new DateTime(2024, 9, 9, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 2, 1, 3, 2, 1 },
                    { 26, new DateTime(2024, 9, 9, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 1, 1, 1, 5, 0 },
                    { 27, new DateTime(2024, 9, 9, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 2, 1, 4, 5, 0 },
                    { 28, new DateTime(2024, 9, 9, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 2, 1, 3, 5, 2 },
                    { 29, new DateTime(2024, 9, 9, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 3, 1, 2, 5, 2 },
                    { 30, new DateTime(2024, 9, 10, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 3, 1, 6, 5, 0 },
                    { 31, new DateTime(2024, 9, 10, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 1, 1, 1, 4, 0 },
                    { 32, new DateTime(2024, 9, 10, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 3, 1, 7, 1, 0 },
                    { 33, new DateTime(2024, 9, 10, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 2, 1, 5, 2, 0 },
                    { 34, new DateTime(2024, 9, 11, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 3, 1, 5, 5, 1 },
                    { 35, new DateTime(2024, 9, 11, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 2, 1, 2, 1, 1 },
                    { 36, new DateTime(2024, 9, 11, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 1, 1, 3, 2, 1 },
                    { 37, new DateTime(2024, 9, 11, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 2, 1, 7, 2, 0 },
                    { 38, new DateTime(2024, 9, 11, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 1, 1, 1, 2, 1 },
                    { 39, new DateTime(2024, 9, 11, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 2, 1, 7, 2, 1 },
                    { 40, new DateTime(2024, 9, 11, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 2, 1, 1, 2, 1 },
                    { 41, new DateTime(2024, 9, 11, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 1, 1, 5, 4, 2 },
                    { 42, new DateTime(2024, 9, 11, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 2, 1, 5, 4, 0 },
                    { 43, new DateTime(2024, 9, 11, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 1, 1, 6, 1, 2 },
                    { 44, new DateTime(2024, 9, 12, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 2, 1, 1, 5, 2 },
                    { 45, new DateTime(2024, 9, 12, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 3, 1, 1, 1, 1 },
                    { 46, new DateTime(2024, 9, 12, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 1, 1, 4, 2, 1 },
                    { 47, new DateTime(2024, 9, 13, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 3, 1, 3, 1, 2 },
                    { 48, new DateTime(2024, 9, 13, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 3, 1, 3, 5, 1 },
                    { 49, new DateTime(2024, 9, 13, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 2, 1, 7, 5, 1 },
                    { 50, new DateTime(2024, 9, 14, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 3, 1, 3, 3, 1 },
                    { 51, new DateTime(2024, 9, 14, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 1, 1, 4, 5, 0 },
                    { 52, new DateTime(2024, 9, 14, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 3, 1, 7, 2, 1 },
                    { 53, new DateTime(2024, 9, 14, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 1, 1, 3, 2, 0 },
                    { 54, new DateTime(2024, 9, 14, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 3, 1, 1, 1, 2 },
                    { 55, new DateTime(2024, 9, 14, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 1, 1, 5, 5, 2 },
                    { 56, new DateTime(2024, 9, 14, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 3, 1, 1, 2, 1 },
                    { 57, new DateTime(2024, 9, 14, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 3, 1, 1, 3, 0 },
                    { 58, new DateTime(2024, 9, 14, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 3, 1, 4, 3, 1 },
                    { 59, new DateTime(2024, 9, 15, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 3, 1, 3, 4, 0 },
                    { 60, new DateTime(2024, 9, 16, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 1, 1, 7, 2, 1 },
                    { 61, new DateTime(2024, 9, 16, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 2, 1, 2, 2, 1 },
                    { 62, new DateTime(2024, 9, 16, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 3, 1, 1, 5, 0 },
                    { 63, new DateTime(2024, 9, 16, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 2, 1, 1, 3, 2 },
                    { 64, new DateTime(2024, 9, 16, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7310), 2, 1, 1, 3, 1 }
                });

            migrationBuilder.InsertData(
                table: "Shifts",
                columns: new[] { "Id", "AddOn", "Date", "DeviceId" },
                values: new object[] { 1, new DateTime(2024, 9, 16, 16, 17, 52, 561, DateTimeKind.Local).AddTicks(7205), new DateOnly(2024, 9, 16), 1 });

            migrationBuilder.CreateIndex(
                name: "IX_Clients_IsDeleted",
                table: "Clients",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_Clients_Name",
                table: "Clients",
                column: "Name",
                unique: true,
                filter: "IsDeleted = 0");

            migrationBuilder.CreateIndex(
                name: "IX_Devices_IsDeleted",
                table: "Devices",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_Devices_RegistrationNumber",
                table: "Devices",
                column: "RegistrationNumber",
                unique: true,
                filter: "IsDeleted = 0");

            migrationBuilder.CreateIndex(
                name: "IX_Distributions_ClientId",
                table: "Distributions",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_Distributions_DeviceId",
                table: "Distributions",
                column: "DeviceId");

            migrationBuilder.CreateIndex(
                name: "IX_Distributions_GoodId",
                table: "Distributions",
                column: "GoodId");

            migrationBuilder.CreateIndex(
                name: "IX_Distributions_IsDeleted",
                table: "Distributions",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_Distributions_LocationId",
                table: "Distributions",
                column: "LocationId");

            migrationBuilder.CreateIndex(
                name: "IX_Goods_IsDeleted",
                table: "Goods",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_Goods_Name",
                table: "Goods",
                column: "Name",
                unique: true,
                filter: "IsDeleted = 0");

            migrationBuilder.CreateIndex(
                name: "IX_Location_IsDeleted",
                table: "Location",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_Location_Name",
                table: "Location",
                column: "Name",
                unique: true,
                filter: "IsDeleted = 0");

            migrationBuilder.CreateIndex(
                name: "IX_Shifts_Date",
                table: "Shifts",
                column: "Date",
                unique: true,
                filter: "IsDeleted = 0");

            migrationBuilder.CreateIndex(
                name: "IX_Shifts_DeviceId",
                table: "Shifts",
                column: "DeviceId");

            migrationBuilder.CreateIndex(
                name: "IX_Shifts_IsDeleted",
                table: "Shifts",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_ShiftVolunteers_VolunteerId",
                table: "ShiftVolunteers",
                column: "VolunteerId");

            migrationBuilder.CreateIndex(
                name: "IX_Volunteers_Firstname_Lastname",
                table: "Volunteers",
                columns: new[] { "Firstname", "Lastname" },
                unique: true,
                filter: "IsDeleted = 0");

            migrationBuilder.CreateIndex(
                name: "IX_Volunteers_IsDeleted",
                table: "Volunteers",
                column: "IsDeleted");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Distributions");

            migrationBuilder.DropTable(
                name: "ShiftVolunteers");

            migrationBuilder.DropTable(
                name: "Clients");

            migrationBuilder.DropTable(
                name: "Goods");

            migrationBuilder.DropTable(
                name: "Location");

            migrationBuilder.DropTable(
                name: "Shifts");

            migrationBuilder.DropTable(
                name: "Volunteers");

            migrationBuilder.DropTable(
                name: "Devices");
        }
    }
}
