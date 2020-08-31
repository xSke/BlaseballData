using System;
using System.Text.Json;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Blase.Core
{
    public class RawUpdate
    {
        public BsonObjectId Id;
        
        [BsonElement("timestamp")]
        public DateTimeOffset Timestamp;
            
        [BsonElement("payload")]
        public BsonDocument Payload;
        
        [BsonElement("hash")]
        public string Hash;

        public RawUpdate()
        {
        }

        public RawUpdate(DateTimeOffset timestamp, JsonElement payload)
        {
            Timestamp = timestamp;
            Payload = BsonDocument.Parse(payload.GetRawText());
            Hash = JsonHash.HashHex(payload);
        }
    }
}