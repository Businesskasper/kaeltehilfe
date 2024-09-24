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
                    { 1, new DateTime(2024, 9, 24, 20, 45, 26, 654, DateTimeKind.Utc).AddTicks(4768), 45, 0, "Martin", "" },
                    { 2, new DateTime(2024, 9, 24, 20, 45, 26, 654, DateTimeKind.Utc).AddTicks(4772), 40, 1, "Martina", "" },
                    { 3, new DateTime(2024, 9, 24, 20, 45, 26, 654, DateTimeKind.Utc).AddTicks(4773), 30, null, "Tim", "" }
                });

            migrationBuilder.InsertData(
                table: "Devices",
                columns: new[] { "Id", "AddOn", "RegistrationNumber" },
                values: new object[] { 1, new DateTime(2024, 9, 24, 20, 45, 26, 654, DateTimeKind.Utc).AddTicks(4542), "UL-RK1013" });

            migrationBuilder.InsertData(
                table: "Goods",
                columns: new[] { "Id", "AddOn", "Description", "GoodType", "Name", "Tags" },
                values: new object[,]
                {
                    { 1, new DateTime(2024, 9, 24, 20, 45, 26, 654, DateTimeKind.Utc).AddTicks(4358), "", 2, "Suppe", "[]" },
                    { 2, new DateTime(2024, 9, 24, 20, 45, 26, 654, DateTimeKind.Utc).AddTicks(4363), "", 2, "Kaffee", "[]" },
                    { 3, new DateTime(2024, 9, 24, 20, 45, 26, 654, DateTimeKind.Utc).AddTicks(4365), "", 2, "Tee", "[]" },
                    { 4, new DateTime(2024, 9, 24, 20, 45, 26, 654, DateTimeKind.Utc).AddTicks(4367), "", 1, "Decke", "[]" },
                    { 5, new DateTime(2024, 9, 24, 20, 45, 26, 654, DateTimeKind.Utc).AddTicks(4369), "", 1, "Socken", "[]" },
                    { 6, new DateTime(2024, 9, 24, 20, 45, 26, 654, DateTimeKind.Utc).AddTicks(4373), "", 0, "Tempos", "[]" },
                    { 7, new DateTime(2024, 9, 24, 20, 45, 26, 654, DateTimeKind.Utc).AddTicks(4375), "", 0, "Deo", "[]" }
                });

            migrationBuilder.InsertData(
                table: "Locations",
                columns: new[] { "Id", "AddOn", "Name" },
                values: new object[,]
                {
                    { 1, new DateTime(2024, 9, 24, 20, 45, 26, 654, DateTimeKind.Utc).AddTicks(4801), "Alter Friedhof" },
                    { 2, new DateTime(2024, 9, 24, 20, 45, 26, 654, DateTimeKind.Utc).AddTicks(4803), "Bahnhof" },
                    { 3, new DateTime(2024, 9, 24, 20, 45, 26, 654, DateTimeKind.Utc).AddTicks(4804), "Neue Mitte" },
                    { 4, new DateTime(2024, 9, 24, 20, 45, 26, 654, DateTimeKind.Utc).AddTicks(4806), "Hirschstraße" },
                    { 5, new DateTime(2024, 9, 24, 20, 45, 26, 654, DateTimeKind.Utc).AddTicks(4807), "Schillerstraße" }
                });

            migrationBuilder.InsertData(
                table: "Volunteers",
                columns: new[] { "Id", "AddOn", "Firstname", "Gender", "IsDriver", "Lastname", "Remarks" },
                values: new object[,]
                {
                    { 1, new DateTime(2024, 9, 24, 20, 45, 26, 654, DateTimeKind.Utc).AddTicks(4447), "Luka", 0, false, "Weis", "" },
                    { 2, new DateTime(2024, 9, 24, 20, 45, 26, 654, DateTimeKind.Utc).AddTicks(4450), "Peter", 0, true, "Pan", "" },
                    { 3, new DateTime(2024, 9, 24, 20, 45, 26, 654, DateTimeKind.Utc).AddTicks(4452), "Max", 0, false, "Mustermann", "" },
                    { 4, new DateTime(2024, 9, 24, 20, 45, 26, 654, DateTimeKind.Utc).AddTicks(4504), "Corinna", 1, true, "Braun", "" }
                });

            migrationBuilder.InsertData(
                table: "Distributions",
                columns: new[] { "Id", "AddOn", "ClientId", "DeviceId", "GoodId", "LocationId", "Quantity" },
                values: new object[,]
                {
                    { 1, new DateTime(2024, 9, 14, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 3, 1, 1, 4, 2 },
                    { 2, new DateTime(2024, 9, 14, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 3, 1, 4, 1, 0 },
                    { 3, new DateTime(2024, 9, 14, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 3, 1, 6, 4, 2 },
                    { 4, new DateTime(2024, 9, 14, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 1, 1, 7, 2, 2 },
                    { 5, new DateTime(2024, 9, 14, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 1, 1, 6, 4, 0 },
                    { 6, new DateTime(2024, 9, 14, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 2, 1, 2, 5, 1 },
                    { 7, new DateTime(2024, 9, 14, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 2, 1, 6, 1, 0 },
                    { 8, new DateTime(2024, 9, 14, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 2, 1, 3, 4, 0 },
                    { 9, new DateTime(2024, 9, 14, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 1, 1, 4, 2, 2 },
                    { 10, new DateTime(2024, 9, 15, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 3, 1, 7, 2, 1 },
                    { 11, new DateTime(2024, 9, 15, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 1, 1, 5, 1, 2 },
                    { 12, new DateTime(2024, 9, 15, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 3, 1, 1, 3, 1 },
                    { 13, new DateTime(2024, 9, 15, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 3, 1, 6, 2, 2 },
                    { 14, new DateTime(2024, 9, 15, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 1, 1, 3, 3, 1 },
                    { 15, new DateTime(2024, 9, 15, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 1, 1, 5, 4, 1 },
                    { 16, new DateTime(2024, 9, 15, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 2, 1, 3, 3, 0 },
                    { 17, new DateTime(2024, 9, 15, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 1, 1, 3, 5, 1 },
                    { 18, new DateTime(2024, 9, 16, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 2, 1, 3, 2, 0 },
                    { 19, new DateTime(2024, 9, 16, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 3, 1, 1, 3, 0 },
                    { 20, new DateTime(2024, 9, 17, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 3, 1, 2, 2, 0 },
                    { 21, new DateTime(2024, 9, 17, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 3, 1, 3, 2, 1 },
                    { 22, new DateTime(2024, 9, 17, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 2, 1, 7, 2, 1 },
                    { 23, new DateTime(2024, 9, 18, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 3, 1, 5, 2, 1 },
                    { 24, new DateTime(2024, 9, 18, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 3, 1, 3, 3, 1 },
                    { 25, new DateTime(2024, 9, 19, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 2, 1, 1, 4, 2 },
                    { 26, new DateTime(2024, 9, 19, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 1, 1, 6, 3, 2 },
                    { 27, new DateTime(2024, 9, 19, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 3, 1, 1, 2, 0 },
                    { 28, new DateTime(2024, 9, 20, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 2, 1, 2, 2, 0 },
                    { 29, new DateTime(2024, 9, 20, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 3, 1, 7, 2, 1 },
                    { 30, new DateTime(2024, 9, 20, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 1, 1, 3, 3, 1 },
                    { 31, new DateTime(2024, 9, 20, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 3, 1, 1, 3, 0 },
                    { 32, new DateTime(2024, 9, 21, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 2, 1, 1, 3, 1 },
                    { 33, new DateTime(2024, 9, 21, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 2, 1, 3, 1, 0 },
                    { 34, new DateTime(2024, 9, 21, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 2, 1, 1, 1, 0 },
                    { 35, new DateTime(2024, 9, 21, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 3, 1, 7, 2, 0 },
                    { 36, new DateTime(2024, 9, 21, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 1, 1, 7, 2, 0 },
                    { 37, new DateTime(2024, 9, 21, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 1, 1, 7, 4, 0 },
                    { 38, new DateTime(2024, 9, 21, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 3, 1, 7, 1, 1 },
                    { 39, new DateTime(2024, 9, 21, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 1, 1, 6, 4, 2 },
                    { 40, new DateTime(2024, 9, 22, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 1, 1, 7, 2, 1 },
                    { 41, new DateTime(2024, 9, 23, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 1, 1, 7, 3, 0 },
                    { 42, new DateTime(2024, 9, 23, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 2, 1, 3, 1, 0 },
                    { 43, new DateTime(2024, 9, 23, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 3, 1, 4, 3, 2 },
                    { 44, new DateTime(2024, 9, 23, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 2, 1, 1, 3, 1 },
                    { 45, new DateTime(2024, 9, 23, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 3, 1, 5, 2, 1 },
                    { 46, new DateTime(2024, 9, 23, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 3, 1, 7, 1, 0 },
                    { 47, new DateTime(2024, 9, 23, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 1, 1, 1, 3, 2 },
                    { 48, new DateTime(2024, 9, 23, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 1, 1, 3, 1, 0 },
                    { 49, new DateTime(2024, 9, 24, 22, 45, 26, 654, DateTimeKind.Local).AddTicks(4834), 1, 1, 6, 3, 1 }
                });

            migrationBuilder.InsertData(
                table: "Shifts",
                columns: new[] { "Id", "AddOn", "Date", "DeviceId" },
                values: new object[] { 1, new DateTime(2024, 9, 24, 20, 45, 26, 654, DateTimeKind.Utc).AddTicks(4736), new DateOnly(2024, 9, 24), 1 });

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
                name: "IX_Distributions_AddOn",
                table: "Distributions",
                column: "AddOn");

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
