using AutoMapper;
using FluentValidation;
using kaeltehilfe_backend.Infrastructure.Database;
using kaeltehilfe_backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace kaeltehilfe_backend.Features.BatchDistributions;

[Route("/api/[controller]")]
public class BatchDistributionsController : ControllerBase
{
    private readonly ILogger<BatchDistributionsController> _logger;
    private readonly KbContext _kbContext;

    public BatchDistributionsController(
        ILogger<BatchDistributionsController> logger,
        KbContext kbContext
    )
    {
        _logger = logger;
        _kbContext = kbContext;
    }

    [HttpPost()]
    [Authorize(Roles = "ADMIN,OPERATOR")]
    public async Task<IActionResult> Create([FromBody] BatchDistributionCreateDto dto)
    {
        var bus =
            await _kbContext.Busses.FirstOrDefaultAsync(b =>
                b.RegistrationNumber == dto.BusRegistrationNumber && !b.IsDeleted
            ) ?? throw this.GetModelStateError("BusId", "No matching shift was found");

        Location? location = null;
        if (!string.IsNullOrEmpty(dto.LocationName))
        {
            location = await _kbContext.Locations.FirstOrDefaultAsync(l =>
                l.Name == dto.LocationName && !l.IsDeleted
            );
            if (location == null)
            {
                location = new Location { Name = dto.LocationName, IsDeleted = false };
                await _kbContext.Locations.AddAsync(location);
                await _kbContext.SaveChangesAsync();
            }
        }

        var clients = await GetClients(dto.Clients);
        var goods = await GetGoods(dto.Goods);

        // Convert GeoLocationDto to Point for storage
        NetTopologySuite.Geometries.Point? geoPoint =
            dto.GeoLocation != null
                ? new NetTopologySuite.Geometries.Point(dto.GeoLocation.Lng, dto.GeoLocation.Lat)
                {
                    SRID = 4326,
                }
                : null;

        List<Distribution> receivedDistributions = dto
            .Clients.SelectMany(s =>
                dto.Goods.Select(g =>
                {
                    var good = goods.GetValueOrDefault(g.Id);
                    var client = clients.GetValueOrDefault(s.Name);
                    return new Distribution
                    {
                        Client = client,
                        Good = good,
                        Location = location,
                        LocationId = location?.Id,
                        GeoLocation = geoPoint,
                        Bus = bus,
                        Quantity = g.Quantity,
                        IsDeleted = false,
                    };
                })
            )
            .ToList();

        await _kbContext.Distributions.AddRangeAsync(receivedDistributions);
        await _kbContext.SaveChangesAsync();

        return Ok();
    }

    private async Task<Dictionary<string, Client>> GetClients(
        List<BatchDistributionClientDto> clientDtos
    )
    {
        Dictionary<string, Client> clients = [];

        foreach (var clientDto in clientDtos)
        {
            Client? client;
            if (clientDto.Id.HasValue)
            {
                client =
                    await _kbContext.Clients.FirstOrDefaultAsync(c =>
                        c.Id == clientDto.Id && !c.IsDeleted
                    )
                    ?? throw this.GetModelStateError(
                        "Clients",
                        $"Client {clientDto.Id} was not found"
                    );
            }
            else
            {
                client = await _kbContext.Clients.FirstOrDefaultAsync(c =>
                    c.Name == clientDto.Name && !c.IsDeleted
                );
                if (client != null)
                {
                    if (
                        client.ApproxAge != clientDto.ApproxAge
                        || client.Gender != clientDto.Gender
                    )
                    {
                        client.Gender = clientDto.Gender;
                        client.ApproxAge = clientDto.ApproxAge;

                        _kbContext.Clients.Update(client);
                        await _kbContext.SaveChangesAsync();
                    }
                }
                else
                {
                    client = new Client
                    {
                        Name = clientDto.Name,
                        Gender = clientDto.Gender,
                        ApproxAge = clientDto.ApproxAge,
                    };
                    await _kbContext.Clients.AddAsync(client);
                    await _kbContext.SaveChangesAsync();
                }
            }

            clients.Add(clientDto.Name, client);
        }

        return clients;
    }

    private async Task<Dictionary<int, Good>> GetGoods(List<BatchDistributionGoodDto> goodDtos)
    {
        var goodIds = goodDtos.Select(g => g.Id).ToList();
        return await _kbContext
            .Goods.Where(g => goodIds.Contains(g.Id) && !g.IsDeleted)
            .ToDictionaryAsync((Good g) => g.Id);
    }
}
