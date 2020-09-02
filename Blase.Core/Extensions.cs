using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Blase.Core
{
    public static class Extensions
    {
        public static Guid? GetGameId(this BsonDocument document)
        {
            if (document.Contains("_id"))
                return new Guid(document["_id"].AsString);
            if (document.Contains("id"))
                return new Guid(document["id"].AsString);
            return null;
        }

        public static Guid AsGuidString(this BsonValue val)
        {
            return new Guid(val.AsString);
        }

        public static async IAsyncEnumerable<T> ToAsyncEnumerable<T>(this Task<IAsyncCursor<T>> task)
        {
            using var cursor = await task;
            while (await cursor.MoveNextAsync())
            {
                foreach (var value in cursor.Current)
                {
                    yield return value;
                }
            }
        }
    }
}