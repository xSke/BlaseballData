using System;
using System.Collections.Generic;

namespace Blase.Server.Controllers.Models
{
    public class IdolsHourlyResponse
    {
        public IdolsHour[] Hourly { get; set; }
        
        public class IdolsHour
        {
            public DateTimeOffset Timestamp { get; set; }
            public Dictionary<string, int> Players { get; set; }
        }   
    }
}