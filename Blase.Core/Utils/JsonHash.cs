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

        private static void VisitWrite(JsonElement elem, Utf8JsonWriter writer)
        {
            switch (elem.ValueKind)
            {
                case JsonValueKind.Object:
                {
                    writer.WriteStartObject();
                    foreach (var prop in elem.EnumerateObject().OrderBy(e => e.Name, StringComparer.Ordinal))
                    {
                        writer.WritePropertyName(prop.Name);
                        VisitWrite(prop.Value, writer);
                    }

                    writer.WriteEndObject();
                    break;
                }
                case JsonValueKind.Array:
                {
                    writer.WriteStartArray();
                    foreach (var e in elem.EnumerateArray())
                        VisitWrite(e, writer);
                    writer.WriteEndArray();
                    break;
                }
                default:
                    elem.WriteTo(writer);
                    break;
            }
        }

        public static byte[] Hash(JsonElement elem)
        {
            using var hasher = SHA256.Create();
            
            using (var hashStream = new CryptoStream(Stream.Null, hasher, CryptoStreamMode.Write))
            using (var jsonWriter = new Utf8JsonWriter(hashStream))
                VisitWrite(elem, jsonWriter);

            return hasher.Hash;
        }
    }
}