using System;
using System.Text.Json;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Blase.Core
{
    public class RawUpdate
    {
        [BsonId] public string Id;
        [BsonElement("firstSeen")] public DateTimeOffset FirstSeen;
        [BsonElement("lastSeen")] public DateTimeOffset LastSeen;
        [BsonElement("payload")] public BsonDocument Payload;

        public RawUpdate()
        {
        }

        public RawUpdate(DateTimeOffset timestamp, JsonElement payload)
        {
            Id = JsonHash.HashHex(payload);
            FirstSeen = timestamp;
            LastSeen = timestamp;
            Payload = BsonDocument.Parse(payload.GetRawText());
        }
    }
}