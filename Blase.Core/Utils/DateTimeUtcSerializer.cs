using System;
using MongoDB.Bson.Serialization;

namespace Blase.Core
{
    public class DateTimeUtcSerializer: IBsonSerializer<DateTimeOffset>
    {
        object IBsonSerializer.Deserialize(BsonDeserializationContext context, BsonDeserializationArgs args) => 
            Deserialize(context, args);

        public void Serialize(BsonSerializationContext context, BsonSerializationArgs args, DateTimeOffset value) => 
            context.Writer.WriteDateTime(value.ToUnixTimeMilliseconds());

        public DateTimeOffset Deserialize(BsonDeserializationContext context, BsonDeserializationArgs args) => 
            DateTimeOffset.FromUnixTimeMilliseconds(context.Reader.ReadDateTime());

        public void Serialize(BsonSerializationContext context, BsonSerializationArgs args, object value) => 
            context.Writer.WriteDateTime(((DateTimeOffset) value).ToUnixTimeMilliseconds());

        public Type ValueType => typeof(DateTimeOffset);
    }
}