using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kaeltehilfe_backend.Application.Infrastructure.Database.Migrations
{
    /// <inheritdoc />
    public partial class AddLastLoginOn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "LastLoginOn",
                table: "Logins",
                type: "INTEGER",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LastLoginOn",
                table: "Logins");
        }
    }
}
