using System;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text.Json;

namespace Blase.Core
{
    public class JsonHash
    {
        public static string HashHex(JsonElement elem) => 
            ToHex(Hash(elem));

        public static string ToHex(byte[] hashData) => 
            BitConverter.ToString(hashData).Replace("-", string.Empty).ToLowerInvariant();

        public static byte[] Hash(JsonElement elem)
        {
            using var hash = new HashingStream(SHA256.Create());
            
            using (var writer = new Utf8JsonWriter(hash))
            {
                void Visit(JsonElement elem)
                {
                    switch (elem.ValueKind)
                    {
                        case JsonValueKind.Object:
                        {
                            writer.WriteStartObject();
                            foreach (var prop in elem.EnumerateObject().OrderBy(e => e.Name, StringComparer.Ordinal))
                            {
                                writer.WritePropertyName(prop.Name);
                                Visit(prop.Value);
                            }

                            writer.WriteEndObject();
                            break;
                        }
                        case JsonValueKind.Array:
                        {
                            writer.WriteStartArray();
                            foreach (var e in elem.EnumerateArray())
                                Visit(e);
                            writer.WriteEndArray();
                            break;
                        }
                        default:
                            elem.WriteTo(writer);
                            break;
                    }
                }
                
                Visit(elem);
            }

            return hash.GetHash();
        }
    }
}