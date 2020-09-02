using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Blase.Core;
using Serilog;

namespace Blase.Ingest
{
    class Program
    {
        static async Task Main(string[] args)
        {
            BlaseCore.Init();
            
            var db = new Datablase();

            if (args.Length == 0 || args[0] == "stream")
                await IngestFromStream(db);
            else if (args[0] == "dir")
                await IngestFromFile(args[1], db);
            else if (args[0] == "reindex")
                await db.UpdateGameIndex();
            else
                Log.Error("Unknown command {Cmd}", args[0]);
        }
        
        private static GameUpdate ParseUpdate(DateTimeOffset timestamp, JsonElement gameObject)
        {
            var gameUpdate = new GameUpdate(timestamp, gameObject);
            return gameUpdate;
        }

        private static DateTimeOffset? ExtractTimestamp(JsonElement root)
        {
            if (!root.TryGetProperty("clientMeta", out var clientMetaProp))
            {
                Log.Warning("Couldn't find clientMeta object, skipping line");
                return null;
            }

            if (!clientMetaProp.TryGetProperty("timestamp", out var timestampProp))
            {
                Log.Warning("Couldn't find timestamp property, skipping line");
                return null;
            }
            
            var timestampNum = timestampProp.GetInt64();
            var timestamp = DateTimeOffset.FromUnixTimeMilliseconds(timestampNum);
            return timestamp;
        }

        private static JsonElement? ExtractSchedule(JsonElement root)
        {
            if (root.TryGetProperty("value", out var valueProp))
                root = valueProp;
            
            if (root.TryGetProperty("games", out var gamesProp))
                root = gamesProp;
            
            if (!root.TryGetProperty("schedule", out var scheduleProp))
            {
                Log.Warning("Couldn't find schedule property, skipping line");
                return null;
            }
            
            return scheduleProp;
        }

        private static async Task IngestFromFile(string filename, Datablase db)
        {
            foreach (var file in Directory.GetFiles(filename))
            {
                if (!file.EndsWith(".json"))
                    continue;
                
                Log.Information("Indexing file {File}", file);

                await using var str = File.OpenRead(file);
                var reader = new StreamReader(str);

                async Task Inner(JsonDocument doc)
                {
                    await Task.Yield();

                    var timestamp = ExtractTimestamp(doc.RootElement);
                    if (timestamp == null)
                        return;
                    
                    var scheduleElem = ExtractSchedule(doc.RootElement);
                    if (scheduleElem == null)
                        return;

                    var updates = scheduleElem.Value.EnumerateArray()
                        .Select(elem => ParseUpdate(timestamp.Value, elem))
                        .Where(u => u != null).ToArray();
                    await db.WriteGameUpdates(updates);
                }
                
                string line;
                var tasks = new List<Task>();
                while ((line = await reader.ReadLineAsync()) != null)
                {
                    var doc = JsonDocument.Parse(line);
                    tasks.Add(Inner(doc));
                }

                await Task.WhenAll(tasks);
            }
            
            Log.Information("Recalculating game indices");
            await db.UpdateGameIndex();
            Log.Information("Done :)");
        }
        
        private static async Task IngestFromStream(Datablase db)
        {
            async void Callback(string obj)
            {
                var timestamp = DateTimeOffset.UtcNow;

                var doc = JsonDocument.Parse(obj);
                var update = new RawUpdate(timestamp, doc.RootElement);
                await db.WriteRaw(update);
                Log.Information("Saved raw event {PayloadHash} at {Timestamp}", update.Id, timestamp);
                
                var scheduleElem = ExtractSchedule(doc.RootElement);
                if (scheduleElem == null)
                    return;
                
                var games = scheduleElem.Value.EnumerateArray()
                    .Select(u => ParseUpdate(timestamp, u))
                    .Where(u => u != null)
                    .ToArray();

                await db.WriteGameUpdates(games);
                await db.WriteGameSummaries(games);
                foreach (var gameUpdate in games)
                    Log.Information("Saved game update {PayloadHash} (game {GameId})", gameUpdate.Id, gameUpdate.GameId);
            }

            var stream = new EventStream(new HttpClient(), Log.Logger);
            await stream.Stream("https://www.blaseball.com/events/streamData", Callback);
        }
    }
}