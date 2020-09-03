using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Blase.Core;
using Nest;
using Serilog;

namespace Blase.Process
{
    class Program
    {
        private const string IndexName = "blaseball-game-events";
        
        static async Task Main(string[] args)
        {
            BlaseCore.Init();
            
            var node = new Uri("http://localhost:9200");
            var settings = new ConnectionSettings(node);
            var client = new ElasticClient(settings);
            
            Log.Information("Clearing index {IndexName}", IndexName);
            await client.Indices.DeleteAsync(Indices.Index(IndexName));

            var db = new Datablase();
            
            var lastTimestamp = DateTimeOffset.MinValue;
            while (true)
            {
                async Task Index(IReadOnlyCollection<ElasticGameEvent> events)
                {
                    await client.IndexManyAsync(events, IndexName);
                    Log.Information("Indexed {IndexCount} game events from {TimestampStart} - {TimestampEnd}",
                        events.Count,
                        events.Min(b => b.Timestamp),
                        events.Max(b => b.Timestamp));
                }
                
                var buf = new List<ElasticGameEvent>();
                await foreach (var update in db.GetGameUpdates(null, lastTimestamp))
                {
                    buf.Add(new ElasticGameEvent(update.FirstSeen, update.Payload, update.Id));

                    if (buf.Count >= 1000)
                    {
                        await Index(buf);
                        buf.Clear();
                    }
                    
                    if (update.FirstSeen > lastTimestamp)
                        lastTimestamp = update.FirstSeen;
                }

                if (buf.Count > 0)
                {
                    await Index(buf);
                    Log.Information("Polling for more events");
                    buf.Clear();
                }
                
                await Task.Delay(2000);
            }
        }
    }
}