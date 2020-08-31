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

        [BsonElement("season")]
        public int Season;
        
        [BsonElement("day")]
        public int Day;
        
        [BsonElement("hash")]
        public string Hash;

        public GameUpdate()
        {
        }

        public GameUpdate(DateTimeOffset timestamp, Guid gameId, JsonElement payload)
        {
            Payload = BsonDocument.Parse(payload.GetRawText());
            Hash = JsonHash.HashHex(payload);

            Timestamp = timestamp;
            GameId = gameId;

            Season = Payload["season"].AsInt32;
            Day = Payload["day"].AsInt32;
        }
    }
}