using System;
using System.Text.Json;

namespace Blase.Server.Controllers.Models
{
    public class ApiGameUpdate
    {
        public string Id { get; set; }
        public DateTimeOffset Timestamp { get; set; }
        public JsonElement Payload { get; set; }
    }
}