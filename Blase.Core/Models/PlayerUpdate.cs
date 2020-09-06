using System;
using System.Text.Json;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Blase.Core
{
    public class PlayerUpdate
    {
        [BsonId] public string Id;
        [BsonElement("player")] public Guid PlayerId;
        [BsonElement("payload")] public BsonDocument Payload;
        [BsonElement("firstSeen")] public DateTimeOffset FirstSeen;
        [BsonElement("lastSeen")] public DateTimeOffset LastSeen;
        
        public PlayerUpdate(DateTimeOffset timestamp, JsonElement payload)
        {
            Id = JsonHash.HashHex(payload);
            Payload = BsonDocument.Parse(payload.GetRawText());
            PlayerId = Payload["id"].AsGuidString();
            FirstSeen = timestamp;
            LastSeen = timestamp;
        }
    }
}