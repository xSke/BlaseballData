using System;
using System.Collections.Generic;
using MongoDB.Bson.Serialization.Attributes;

namespace Blase.Core
{
    public class IdolsHourly
    {
        [BsonId] public DateTimeOffset Hour { get; set; }
        [BsonElement("players")] public Dictionary<Guid, int> Players { get; set; }
    }
}