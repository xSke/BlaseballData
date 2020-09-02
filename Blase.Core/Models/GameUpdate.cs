using System;
using System.Text.Json;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Blase.Core
{
    public class GameUpdate
    {
        [BsonId] public string Id;

        [BsonElement("firstSeen")] public DateTimeOffset FirstSeen;

        [BsonElement("lastSeen")] public DateTimeOffset LastSeen;

        [BsonElement("game")] public Guid GameId;

        [BsonElement("payload")] public BsonDocument Payload;

        public GameUpdate()
        {
        }

        public GameUpdate(DateTimeOffset timestamp, JsonElement payload)
        {
            Id = JsonHash.HashHex(payload);
            Payload = BsonDocument.Parse(payload.GetRawText());

            FirstSeen = timestamp;
            LastSeen = timestamp;

            var gameId = Payload.GetGameId();
            if (gameId == null)
                throw new ArgumentException("Could not extract game ID from payload");
            
            GameId = gameId.Value;
        }
    }
}