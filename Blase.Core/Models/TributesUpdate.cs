using System;
using System.Text.Json;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Attributes;

namespace Blase.Core
{
    public class TributesUpdate
    {
        [BsonId] public string Id;
        [BsonElement("firstSeen")] public DateTimeOffset FirstSeen;
        [BsonElement("lastSeen")] public DateTimeOffset LastSeen;
        [BsonElement("payload")] public BsonValue Payload;

        public TributesUpdate()
        {
        }

        public TributesUpdate(DateTimeOffset timestamp, JsonElement payload)
        {
            // Id = JsonHash.HashHex(payload); // temporarily don't store by hash...
            Id = Guid.NewGuid().ToString();
            FirstSeen = timestamp;
            LastSeen = timestamp;

            Payload = BsonSerializer.Deserialize<BsonValue>(payload.GetRawText());
        }
    }
}