using System;
using System.Text.Json;

namespace Blase.Server.Controllers.Models
{
    public class SimResponse
    {
        public DateTimeOffset Timestamp { get; set; }
        public JsonElement Sim { get; set; }
    }
}