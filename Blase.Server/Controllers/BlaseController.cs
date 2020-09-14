using System;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Blase.Core;
using Blase.Server.Controllers.Models;
using Microsoft.AspNetCore.Mvc;

namespace Blase.Server.Controllers
{
    [ApiController]
    [Route("api")]
    public class BlaseController : ControllerBase
    {
        private readonly Datablase _db;

        public BlaseController(Datablase db)
        {
            _db = db;
        }

        [Route("games")]
        public async Task<GameListResponse> ListGames([Required, FromQuery] GameQueryFilter filter)
        {
            var days = _db.GetGamesByDay(filter.Season, filter.Day, filter.Reverse);

            if (filter.DayCount != null)
                days = days.Take(filter.DayCount.Value);

            return new GameListResponse
            {
                Days = await days
                    .Select(gd => new ApiGameDay
                    {
                        Season = gd.Season,
                        Day = gd.Day,
                        Games = gd.Games
                            .Select(g => new ApiGame
                            {
                                Id = g.Id,
                                Start = g.Start,
                                End = g.End,
                                LastUpdate = JsonDocument.Parse(g.LastUpdate.ToString()).RootElement,
                                LastUpdateTime = g.LastUpdateTime
                            })
                            .ToArray(),
                        Start = gd.Start
                    })
                    .ToArrayAsync()
            };
        }

        [Route("idols/hourly")]
        public async Task<IdolsHourlyResponse> IdolsHourly()
        {
            var hourly = _db.GetIdolsHourly();
            return new IdolsHourlyResponse
            {
                Hourly = await hourly.Select(h =>
                    new IdolsHourlyResponse.IdolsHour
                    {
                        Timestamp = h.Hour,
                        Players = h.Players.ToDictionary(k => k.Key.ToString(), v => v.Value)
                    }
                )
                    .OrderBy(h => h.Timestamp)
                    .ToArrayAsync()
            };
        }

        [Route("sim")]
        public async Task<SimResponse> GetSim()
        {
            var (timestamp, sim) = await _db.GetLastSim();
            return new SimResponse
            {
                Sim = JsonDocument.Parse(sim.ToString()).RootElement,
                Timestamp = timestamp
            };
        }

        [Route("games/{gameId}/updates")]
        public async Task<GameUpdatesResponse> ListGameUpdates(Guid gameId, [Required, FromQuery] GameUpdateQueryFilter filter)
        {
            var updates = _db.GetGameUpdates(gameId, filter.After ?? DateTimeOffset.MinValue);

            if (filter.Count != null)
                updates = updates.Take(filter.Count.Value);

            return new GameUpdatesResponse
            {
                Updates = await updates
                    .Select(u => new ApiGameUpdate
                    {
                        Id = u.Id,
                        Payload = JsonDocument.Parse(u.Payload.ToString()).RootElement,
                        Timestamp = u.FirstSeen
                    })
                    .ToArrayAsync()
            };
        }
    }
}