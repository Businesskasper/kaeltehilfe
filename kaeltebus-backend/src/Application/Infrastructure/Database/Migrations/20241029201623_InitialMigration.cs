using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kaeltebus_backend.Application.Infrastructure.Database.Migrations
{
    /// <inheritdoc />
    public partial class InitialMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Busses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    RegistrationNumber = table.Column<string>(type: "TEXT", nullable: false),
                    AddOn = table.Column<long>(type: "INTEGER", nullable: false, defaultValueSql: "unixepoch('now')"),
                    ChangeOn = table.Column<long>(type: "INTEGER", nullable: true, defaultValueSql: "unixepoch('now')"),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Busses", x => x.Id);
                });

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
                    AddOn = table.Column<long>(type: "INTEGER", nullable: false, defaultValueSql: "unixepoch('now')"),
                    ChangeOn = table.Column<long>(type: "INTEGER", nullable: true, defaultValueSql: "unixepoch('now')"),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Clients", x => x.Id);
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
                    TwoWeekThreshold = table.Column<int>(type: "INTEGER", nullable: true),
                    AddOn = table.Column<long>(type: "INTEGER", nullable: false, defaultValueSql: "unixepoch('now')"),
                    ChangeOn = table.Column<long>(type: "INTEGER", nullable: true, defaultValueSql: "unixepoch('now')"),
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
                    AddOn = table.Column<long>(type: "INTEGER", nullable: false, defaultValueSql: "unixepoch('now')"),
                    ChangeOn = table.Column<long>(type: "INTEGER", nullable: true, defaultValueSql: "unixepoch('now')"),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Locations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Logins",
                columns: table => new
                {
                    Username = table.Column<string>(type: "TEXT", nullable: false),
                    IdentityProviderId = table.Column<string>(type: "TEXT", nullable: false),
                    Email = table.Column<string>(type: "TEXT", nullable: false),
                    CreateOn = table.Column<long>(type: "INTEGER", nullable: false),
                    Role = table.Column<int>(type: "INTEGER", nullable: false),
                    Firstname = table.Column<string>(type: "TEXT", nullable: true),
                    Lastname = table.Column<string>(type: "TEXT", nullable: true),
                    RegistrationNumber = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Logins", x => x.Username);
                    table.UniqueConstraint("AK_Logins_IdentityProviderId", x => x.IdentityProviderId);
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
                    AddOn = table.Column<long>(type: "INTEGER", nullable: false, defaultValueSql: "unixepoch('now')"),
                    ChangeOn = table.Column<long>(type: "INTEGER", nullable: true, defaultValueSql: "unixepoch('now')"),
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
                    BusId = table.Column<int>(type: "INTEGER", nullable: false),
                    Date = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    AddOn = table.Column<long>(type: "INTEGER", nullable: false, defaultValueSql: "unixepoch('now')"),
                    ChangeOn = table.Column<long>(type: "INTEGER", nullable: true, defaultValueSql: "unixepoch('now')"),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Shifts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Shifts_Busses_BusId",
                        column: x => x.BusId,
                        principalTable: "Busses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Distributions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    BusId = table.Column<int>(type: "INTEGER", nullable: false),
                    ClientId = table.Column<int>(type: "INTEGER", nullable: false),
                    GoodId = table.Column<int>(type: "INTEGER", nullable: false),
                    LocationId = table.Column<int>(type: "INTEGER", nullable: false),
                    Quantity = table.Column<int>(type: "INTEGER", nullable: false),
                    AddOn = table.Column<long>(type: "INTEGER", nullable: false, defaultValueSql: "unixepoch('now')"),
                    ChangeOn = table.Column<long>(type: "INTEGER", nullable: true, defaultValueSql: "unixepoch('now')"),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Distributions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Distributions_Busses_BusId",
                        column: x => x.BusId,
                        principalTable: "Busses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Distributions_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
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
                name: "LoginCertificates",
                columns: table => new
                {
                    Thumbprint = table.Column<string>(type: "TEXT", nullable: false),
                    ValidFrom = table.Column<long>(type: "INTEGER", nullable: false),
                    ValidTo = table.Column<long>(type: "INTEGER", nullable: false),
                    FileName = table.Column<string>(type: "TEXT", nullable: false),
                    LoginUsername = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LoginCertificates", x => x.Thumbprint);
                    table.ForeignKey(
                        name: "FK_LoginCertificates_Logins_LoginUsername",
                        column: x => x.LoginUsername,
                        principalTable: "Logins",
                        principalColumn: "Username");
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

            migrationBuilder.CreateIndex(
                name: "IX_Busses_IsDeleted",
                table: "Busses",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_Busses_RegistrationNumber",
                table: "Busses",
                column: "RegistrationNumber",
                unique: true,
                filter: "IsDeleted = 0");

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
                name: "IX_Distributions_AddOn",
                table: "Distributions",
                column: "AddOn");

            migrationBuilder.CreateIndex(
                name: "IX_Distributions_BusId",
                table: "Distributions",
                column: "BusId");

            migrationBuilder.CreateIndex(
                name: "IX_Distributions_ClientId",
                table: "Distributions",
                column: "ClientId");

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
                name: "IX_LoginCertificates_LoginUsername",
                table: "LoginCertificates",
                column: "LoginUsername");

            migrationBuilder.CreateIndex(
                name: "IX_Shifts_BusId",
                table: "Shifts",
                column: "BusId");

            migrationBuilder.CreateIndex(
                name: "IX_Shifts_Date",
                table: "Shifts",
                column: "Date",
                unique: true,
                filter: "IsDeleted = 0");

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
                name: "LoginCertificates");

            migrationBuilder.DropTable(
                name: "ShiftVolunteers");

            migrationBuilder.DropTable(
                name: "Clients");

            migrationBuilder.DropTable(
                name: "Goods");

            migrationBuilder.DropTable(
                name: "Locations");

            migrationBuilder.DropTable(
                name: "Logins");

            migrationBuilder.DropTable(
                name: "Shifts");

            migrationBuilder.DropTable(
                name: "Volunteers");

            migrationBuilder.DropTable(
                name: "Busses");
        }
    }
}
