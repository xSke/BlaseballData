using System;
using System.Text.Json;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Attributes;

namespace Blase.Core
{
    public class GlobalEventsUpdate
    {
        [BsonId] public string Id;
        [BsonElement("firstSeen")] public DateTimeOffset FirstSeen;
        [BsonElement("lastSeen")] public DateTimeOffset LastSeen;
        [BsonElement("payload")] public BsonValue Payload;
        
        public GlobalEventsUpdate(DateTimeOffset timestamp, JsonElement payload)
        {
            Id = JsonHash.HashHex(payload);
            Payload = BsonSerializer.Deserialize<BsonValue>(payload.GetRawText());

            FirstSeen = timestamp;
            LastSeen = timestamp;
        }
    }
}