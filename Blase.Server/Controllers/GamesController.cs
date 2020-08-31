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
    [Route("api/games")]
    public class GamesController : ControllerBase
    {
        private readonly Datablase _db;

        public GamesController(Datablase db)
        {
            _db = db;
        }

        [HttpGet("{id}/events")]
        public async Task<IEnumerable<GameUpdateDto>> GameEvents(Guid id)
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
    }
}