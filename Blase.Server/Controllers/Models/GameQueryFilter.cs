using System;
using System.ComponentModel.DataAnnotations;

namespace Blase.Server.Controllers.Models
{
    public class GameQueryFilter
    {
        [Required] public int Season { get; set; }
        public int Day { get; set; } = 0;
        public int? DayCount { get; set; }
        public bool Reverse { get; set; } = false;
        
        public Guid[] TeamFilter { get; set; }
    }
}