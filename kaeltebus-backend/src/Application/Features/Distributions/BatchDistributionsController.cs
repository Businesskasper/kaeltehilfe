using AutoMapper;
using FluentValidation;
using kaeltebus_backend.Infrastructure.Database;
using kaeltebus_backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace kaeltebus_backend.Features.BatchDistributions;

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
    [Authorize(Roles = "Admin,Operator")]
    public async Task<IActionResult> Create([FromBody] BatchDistributionCreateDto dto)
    {
        // TODO: Adjust device lookup for calling device
        var device = await _kbContext.Devices.FirstOrDefaultAsync();
        if (device == null)
            this.ThrowModelStateError("DeviceId", "No matching shift was found");

        var location = await _kbContext.Locations.FirstOrDefaultAsync(l =>
            l.Name == dto.LocationName
        );
        if (location == null)
        {
            location = new Location { Name = dto.LocationName, IsDeleted = false };
            await _kbContext.Locations.AddAsync(location);
            await _kbContext.SaveChangesAsync();
        }
        var clients = await GetClients(dto.Clients);
        var goods = await GetGoods(dto.Goods);

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
                        Device = device,
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
                client = await _kbContext.Clients.FindAsync(clientDto.Id);

                if (client == null)
                {
                    throw this.GetModelStateError(
                        "Clients",
                        $"Client {clientDto.Id} was not found"
                    );
                }
            }

            client = await _kbContext.Clients.FirstOrDefaultAsync(c => c.Name == clientDto.Name);
            if (client != null)
            {
                if (client.ApproxAge != clientDto.ApproxAge || client.Gender != clientDto.Gender)
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
            clients.Add(clientDto.Name, client);
        }

        return clients;
    }

    private async Task<Dictionary<int, Good>> GetGoods(List<BatchDistributionGoodDto> goodDtos)
    {
        var goodIds = goodDtos.Select(g => g.Id).ToList();
        return await _kbContext
            .Goods.Where(g => goodIds.Contains(g.Id))
            .ToDictionaryAsync((Good g) => g.Id);
    }
}
