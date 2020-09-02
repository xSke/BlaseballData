using System;

namespace Blase.Server.Controllers.Models
{
    public class ApiGameDay
    {
        public int Season { get; set; }
        public int Day { get; set; }
        public DateTimeOffset? Start { get; set; }
        public ApiGame[] Games { get; set; }
    }
}