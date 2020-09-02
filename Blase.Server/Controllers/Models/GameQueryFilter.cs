using System;
using System.ComponentModel.DataAnnotations;

namespace Blase.Server.Controllers.Models
{
    public class GameQueryFilter
    {
        [Required] public int Season { get; set; }
        public int? Day { get; set; }
        public int? DayCount { get; set; }
        
        public Guid[] TeamFilter { get; set; }
    }
}