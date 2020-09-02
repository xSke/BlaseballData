using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Blase.Core
{
    public class Game
    {
        [BsonId] public Guid Id;

        [BsonElement("season")] public int Season;
        
        [BsonElement("day")] public int Day;
        
        [BsonElement("start")] public DateTimeOffset? Start;
        
        [BsonElement("end")] public DateTimeOffset? End;
        
        [BsonElement("lastUpdate")] public BsonDocument LastUpdate;

        [BsonElement("lastUpdateTime")] public DateTimeOffset LastUpdateTime;
    }
}