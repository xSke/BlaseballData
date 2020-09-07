using System;
using System.Security.Cryptography;
using System.Text;
using MongoDB.Bson.Serialization.Attributes;

namespace Blase.Core
{
    public class JsUpdate
    {
        [BsonId] public string Id;
        [BsonElement("url")] public string Url;
        [BsonElement("firstSeen")] public DateTimeOffset FirstSeen;
        [BsonElement("lastSeen")] public DateTimeOffset LastSeen;
        [BsonElement("content")] public string Content;

        public JsUpdate(DateTimeOffset timestamp, string url, byte[] data)
        {
            var hash = SHA256.Create().ComputeHash(data);
            Id = JsonHash.ToHex(hash);
            Url = url;
            FirstSeen = timestamp;
            LastSeen = timestamp;
            Content = Encoding.UTF8.GetString(data);
        }
    }
}