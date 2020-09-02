using System;
using System.Text.Json;

namespace Blase.Server.Controllers.Models
{
    public class ApiGame
    {
        public Guid Id { get; set; }
        public DateTimeOffset? Start { get; set; }
        public DateTimeOffset? End { get; set; }

        public JsonElement LastUpdate { get; set; }
        public DateTimeOffset LastUpdateTime { get; set; }
    }
}