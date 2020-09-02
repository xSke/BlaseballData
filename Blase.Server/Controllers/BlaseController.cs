using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Blase.Core;
using Blase.Server.Controllers.Models;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;

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
            var days = _db.GetGamesByDay(filter.Season, filter.Day ?? 0);

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

        // [HttpGet("seasons/{season}/games")]
        // public async Task<List<GameDto>> SeasonGames(int season)
        // {
        //     var output = new List<GameDto>();
        //     await foreach (var game in _db.QueryGamesInSeason(season))
        //         output.Add(new GameDto
        //         {
        //             Id = game.Id,
        //             Season = game.Season,
        //             Day = game.Day,
        //             Start = game.Start,
        //             End = game.End,
        //             LastUpdate = JsonDocument.Parse(game.LastUpdate.ToString()).RootElement
        //         });
        //     return output;
        // }
        //
        // [HttpGet("games/{id}/events")]
        // public async Task<List<GameUpdateDto>> GameEvents(Guid id)
        // {
        //     var output = new List<GameUpdateDto>();
        //     
        //     await foreach (var update in _db.QueryGameUpdatesFor(id))
        //         output.Add(new GameUpdateDto
        //         {
        //             Timestamp = update.Timestamp,
        //             Payload = JsonDocument.Parse(update.Payload.ToString()).RootElement
        //         });
        //
        //     return output;
        // }

        /*public class GameUpdateDto
        {
            public DateTimeOffset Timestamp { get; set; }
            public JsonElement Payload { get; set; }
        }

        public class GameDto
        {
            public Guid Id { get; set; }
            public int Season { get; set; }
            public int Day { get; set; }
            public JsonElement LastUpdate { get; set; }
            
            public DateTimeOffset Start { get; set; }
            public DateTimeOffset? End { get; set; }
        }*/
    }
}