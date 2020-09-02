using System;

namespace Blase.Server.Controllers.Models
{
    public class GameUpdateQueryFilter
    {
        public DateTimeOffset? After { get; set; }
        public int? Count { get; set; }
    }
}