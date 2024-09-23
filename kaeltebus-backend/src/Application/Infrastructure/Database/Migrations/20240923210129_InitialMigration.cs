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
                    Gender = table.Column<int>(type: "INTEGER", nullable: true),
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
                name: "Locations",
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
                    table.PrimaryKey("PK_Locations", x => x.Id);
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
                        name: "FK_Distributions_Locations_LocationId",
                        column: x => x.LocationId,
                        principalTable: "Locations",
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
                    { 1, new DateTime(2024, 9, 23, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2094), 45, 0, "Martin", "" },
                    { 2, new DateTime(2024, 9, 23, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2099), 40, 1, "Martina", "" },
                    { 3, new DateTime(2024, 9, 23, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2102), 30, null, "Tim", "" }
                });

            migrationBuilder.InsertData(
                table: "Devices",
                columns: new[] { "Id", "AddOn", "RegistrationNumber" },
                values: new object[] { 1, new DateTime(2024, 9, 23, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(1899), "UL-RK1013" });

            migrationBuilder.InsertData(
                table: "Goods",
                columns: new[] { "Id", "AddOn", "Description", "GoodType", "Name", "Tags" },
                values: new object[,]
                {
                    { 1, new DateTime(2024, 9, 23, 0, 0, 0, 0, DateTimeKind.Local), "", 2, "Suppe", "[]" },
                    { 2, new DateTime(2024, 9, 23, 0, 0, 0, 0, DateTimeKind.Local), "", 2, "Kaffee", "[]" },
                    { 3, new DateTime(2024, 9, 23, 0, 0, 0, 0, DateTimeKind.Local), "", 2, "Tee", "[]" },
                    { 4, new DateTime(2024, 9, 23, 0, 0, 0, 0, DateTimeKind.Local), "", 1, "Decke", "[]" },
                    { 5, new DateTime(2024, 9, 23, 0, 0, 0, 0, DateTimeKind.Local), "", 1, "Socken", "[]" },
                    { 6, new DateTime(2024, 9, 23, 0, 0, 0, 0, DateTimeKind.Local), "", 0, "Tempos", "[]" },
                    { 7, new DateTime(2024, 9, 23, 0, 0, 0, 0, DateTimeKind.Local), "", 0, "Deo", "[]" }
                });

            migrationBuilder.InsertData(
                table: "Locations",
                columns: new[] { "Id", "AddOn", "Name" },
                values: new object[,]
                {
                    { 1, new DateTime(2024, 9, 23, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2130), "Alter Friedhof" },
                    { 2, new DateTime(2024, 9, 23, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2186), "Bahnhof" },
                    { 3, new DateTime(2024, 9, 23, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2190), "Neue Mitte" },
                    { 4, new DateTime(2024, 9, 23, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2192), "Hirschstraße" },
                    { 5, new DateTime(2024, 9, 23, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2195), "Schillerstraße" }
                });

            migrationBuilder.InsertData(
                table: "Volunteers",
                columns: new[] { "Id", "AddOn", "Firstname", "Gender", "IsDriver", "Lastname", "Remarks" },
                values: new object[,]
                {
                    { 1, new DateTime(2024, 9, 23, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(1850), "Luka", 0, false, "Weis", "" },
                    { 2, new DateTime(2024, 9, 23, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(1855), "Peter", 0, true, "Pan", "" },
                    { 3, new DateTime(2024, 9, 23, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(1858), "Max", 0, false, "Mustermann", "" },
                    { 4, new DateTime(2024, 9, 23, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(1861), "Corinna", 1, true, "Braun", "" }
                });

            migrationBuilder.InsertData(
                table: "Distributions",
                columns: new[] { "Id", "AddOn", "ClientId", "DeviceId", "GoodId", "LocationId", "Quantity" },
                values: new object[,]
                {
                    { 1, new DateTime(2024, 9, 13, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 1, 1, 5, 2, 0 },
                    { 2, new DateTime(2024, 9, 13, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 3, 1, 6, 3, 0 },
                    { 3, new DateTime(2024, 9, 13, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 2, 1, 6, 4, 0 },
                    { 4, new DateTime(2024, 9, 13, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 2, 1, 4, 2, 1 },
                    { 5, new DateTime(2024, 9, 13, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 2, 1, 6, 2, 1 },
                    { 6, new DateTime(2024, 9, 13, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 2, 1, 1, 2, 1 },
                    { 7, new DateTime(2024, 9, 14, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 1, 1, 5, 4, 0 },
                    { 8, new DateTime(2024, 9, 14, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 2, 1, 4, 2, 1 },
                    { 9, new DateTime(2024, 9, 14, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 3, 1, 2, 5, 1 },
                    { 10, new DateTime(2024, 9, 14, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 1, 1, 6, 1, 2 },
                    { 11, new DateTime(2024, 9, 14, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 3, 1, 7, 1, 0 },
                    { 12, new DateTime(2024, 9, 14, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 1, 1, 1, 2, 0 },
                    { 13, new DateTime(2024, 9, 14, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 2, 1, 4, 4, 2 },
                    { 14, new DateTime(2024, 9, 15, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 2, 1, 6, 2, 1 },
                    { 15, new DateTime(2024, 9, 15, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 3, 1, 4, 2, 1 },
                    { 16, new DateTime(2024, 9, 15, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 3, 1, 1, 4, 0 },
                    { 17, new DateTime(2024, 9, 15, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 1, 1, 4, 1, 1 },
                    { 18, new DateTime(2024, 9, 15, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 2, 1, 6, 5, 2 },
                    { 19, new DateTime(2024, 9, 15, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 2, 1, 3, 1, 1 },
                    { 20, new DateTime(2024, 9, 15, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 3, 1, 4, 4, 1 },
                    { 21, new DateTime(2024, 9, 15, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 2, 1, 1, 3, 0 },
                    { 22, new DateTime(2024, 9, 16, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 2, 1, 5, 4, 1 },
                    { 23, new DateTime(2024, 9, 16, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 2, 1, 1, 4, 2 },
                    { 24, new DateTime(2024, 9, 16, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 1, 1, 1, 4, 1 },
                    { 25, new DateTime(2024, 9, 16, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 1, 1, 2, 2, 0 },
                    { 26, new DateTime(2024, 9, 16, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 2, 1, 1, 2, 0 },
                    { 27, new DateTime(2024, 9, 16, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 2, 1, 7, 1, 1 },
                    { 28, new DateTime(2024, 9, 17, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 2, 1, 1, 1, 0 },
                    { 29, new DateTime(2024, 9, 17, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 1, 1, 7, 1, 1 },
                    { 30, new DateTime(2024, 9, 17, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 1, 1, 5, 4, 2 },
                    { 31, new DateTime(2024, 9, 17, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 2, 1, 5, 2, 1 },
                    { 32, new DateTime(2024, 9, 18, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 1, 1, 4, 4, 1 },
                    { 33, new DateTime(2024, 9, 18, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 1, 1, 2, 4, 0 },
                    { 34, new DateTime(2024, 9, 18, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 1, 1, 3, 3, 2 },
                    { 35, new DateTime(2024, 9, 18, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 2, 1, 5, 3, 0 },
                    { 36, new DateTime(2024, 9, 18, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 3, 1, 4, 2, 1 },
                    { 37, new DateTime(2024, 9, 18, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 1, 1, 5, 4, 0 },
                    { 38, new DateTime(2024, 9, 18, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 3, 1, 7, 4, 1 },
                    { 39, new DateTime(2024, 9, 18, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 3, 1, 6, 2, 2 },
                    { 40, new DateTime(2024, 9, 18, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 3, 1, 7, 5, 1 },
                    { 41, new DateTime(2024, 9, 19, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 2, 1, 6, 1, 0 },
                    { 42, new DateTime(2024, 9, 19, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 1, 1, 7, 1, 1 },
                    { 43, new DateTime(2024, 9, 19, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 2, 1, 4, 1, 0 },
                    { 44, new DateTime(2024, 9, 19, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 3, 1, 2, 1, 2 },
                    { 45, new DateTime(2024, 9, 19, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 2, 1, 1, 2, 2 },
                    { 46, new DateTime(2024, 9, 19, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 2, 1, 4, 1, 1 },
                    { 47, new DateTime(2024, 9, 19, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 2, 1, 4, 1, 1 },
                    { 48, new DateTime(2024, 9, 19, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 3, 1, 3, 3, 1 },
                    { 49, new DateTime(2024, 9, 19, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 2, 1, 6, 1, 1 },
                    { 50, new DateTime(2024, 9, 20, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 3, 1, 4, 5, 2 },
                    { 51, new DateTime(2024, 9, 20, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 2, 1, 1, 2, 0 },
                    { 52, new DateTime(2024, 9, 20, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 2, 1, 3, 1, 2 },
                    { 53, new DateTime(2024, 9, 21, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 1, 1, 7, 4, 0 },
                    { 54, new DateTime(2024, 9, 21, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 1, 1, 1, 1, 0 },
                    { 55, new DateTime(2024, 9, 21, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 1, 1, 3, 5, 1 },
                    { 56, new DateTime(2024, 9, 21, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 2, 1, 5, 3, 1 },
                    { 57, new DateTime(2024, 9, 22, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 3, 1, 1, 2, 1 },
                    { 58, new DateTime(2024, 9, 22, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 1, 1, 4, 5, 1 },
                    { 59, new DateTime(2024, 9, 22, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 1, 1, 1, 5, 0 },
                    { 60, new DateTime(2024, 9, 22, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 2, 1, 6, 2, 1 },
                    { 61, new DateTime(2024, 9, 23, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 1, 1, 3, 2, 2 },
                    { 62, new DateTime(2024, 9, 23, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 2, 1, 1, 3, 1 },
                    { 63, new DateTime(2024, 9, 23, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 3, 1, 3, 1, 1 },
                    { 64, new DateTime(2024, 9, 23, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 3, 1, 6, 2, 0 },
                    { 65, new DateTime(2024, 9, 23, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2226), 2, 1, 7, 1, 0 }
                });

            migrationBuilder.InsertData(
                table: "Shifts",
                columns: new[] { "Id", "AddOn", "Date", "DeviceId" },
                values: new object[] { 1, new DateTime(2024, 9, 23, 23, 1, 28, 849, DateTimeKind.Local).AddTicks(2059), new DateOnly(2024, 9, 23), 1 });

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
                name: "IX_Locations_IsDeleted",
                table: "Locations",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_Locations_Name",
                table: "Locations",
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
                name: "Locations");

            migrationBuilder.DropTable(
                name: "Shifts");

            migrationBuilder.DropTable(
                name: "Volunteers");

            migrationBuilder.DropTable(
                name: "Devices");
        }
    }
}
