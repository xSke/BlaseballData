using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;
using Serilog;

namespace Blase.Core
{
    public class BlaseCore
    {
        public static void Init()
        {
            Log.Logger = new LoggerConfiguration()
                .WriteTo.Console()
                .CreateLogger();
            
            BsonSerializer.RegisterSerializer(new GuidSerializer(BsonType.String));
            BsonSerializer.RegisterSerializer(typeof(DateTimeOffset), new DateTimeUtcSerializer());
        }
    }
}