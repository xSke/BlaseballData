using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Blase.Core
{
    public class Game
    {
        [BsonId]
        public Guid Id;

        [BsonElement("season")]
        public int Season;
        
        [BsonElement("day")]
        public int Day;
        
        [BsonElement("start")]
        public DateTimeOffset Start;
        
        [BsonElement("end")]
        public DateTimeOffset? End;
        
        [BsonElement("last_update")]
        public BsonDocument LastUpdate;
        
        [BsonElement("last_update_hash")]
        public string LastUpdateHash;
    }
}