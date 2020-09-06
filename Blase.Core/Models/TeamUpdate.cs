using System;
using System.Text.Json;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Blase.Core
{
    public class TeamUpdate
    {
        [BsonId] public string Id;
        [BsonElement("team")] public Guid TeamId;
        [BsonElement("payload")] public BsonDocument Payload;
        [BsonElement("firstSeen")] public DateTimeOffset FirstSeen;
        [BsonElement("lastSeen")] public DateTimeOffset LastSeen;
        
        public TeamUpdate(DateTimeOffset timestamp, JsonElement payload)
        {
            Id = JsonHash.HashHex(payload);
            Payload = BsonDocument.Parse(payload.GetRawText());
            TeamId = Payload["id"].AsGuidString();
            FirstSeen = timestamp;
            LastSeen = timestamp;
        }
    }
}