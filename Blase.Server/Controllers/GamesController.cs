using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Blase.Core;
using Microsoft.AspNetCore.Mvc;

namespace Blase.Server.Controllers
{
    [ApiController]
    [Route("api")]
    public class GamesController : ControllerBase
    {
        private readonly Datablase _db;

        public GamesController(Datablase db)
        {
            _db = db;
        }

        [HttpGet("seasons/{season}/games")]
        public async Task<List<GameDto>> SeasonGames(int season)
        {
            var output = new List<GameDto>();
            await foreach (var game in _db.QueryGamesInSeason(season))
                output.Add(new GameDto
                {
                    Id = game.Id,
                    Season = game.Season,
                    Day = game.Day,
                    Start = game.Start,
                    End = game.End,
                    LastUpdate = JsonDocument.Parse(game.LastUpdate.ToString()).RootElement
                });
            return output;
        }

        [HttpGet("games/{id}/events")]
        public async Task<List<GameUpdateDto>> GameEvents(Guid id)
        {
            var output = new List<GameUpdateDto>();
            
            await foreach (var update in _db.QueryGameUpdatesFor(id))
                output.Add(new GameUpdateDto
                {
                    Timestamp = update.Timestamp,
                    Payload = JsonDocument.Parse(update.Payload.ToString()).RootElement
                });

            return output;
        }

        public class GameUpdateDto
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
        }
    }
}