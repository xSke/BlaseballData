using System;
using System.Text.Json;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Blase.Core
{
    public class GameUpdate
    {
        public BsonObjectId Id;
        
        [BsonElement("timestamp")]
        public DateTimeOffset Timestamp;
        
        [BsonElement("game_id")]
        public Guid GameId;
        
        [BsonElement("payload")]
        public BsonDocument Payload;
        
        [BsonElement("hash")]
        public string Hash;

        public GameUpdate()
        {
        }

        public GameUpdate(DateTimeOffset timestamp, Guid gameId, JsonElement payload)
        {
            Timestamp = timestamp;
            GameId = gameId;
            Payload = BsonDocument.Parse(payload.GetRawText());
            Hash = JsonHash.HashHex(payload);
        }
    }
}