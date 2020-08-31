using System;
using System.Collections.Generic;
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
                var tasks = new List<Task>();
                await foreach (var update in db.QueryGameUpdatesSince(lastTimestamp))
                {
                    var ege = new ElasticGameEvent(update.Timestamp, update.Payload);

                    async Task Inner()
                    {
                        await client.IndexAsync(ege, idx => idx.Id(new Id(update.Hash)).Index(IndexName));
                        Log.Information("Indexed game event for {GameId} @ {Timestamp}", update.GameId, update.Timestamp);
                    }

                    tasks.Add(Inner());

                    if (update.Timestamp > lastTimestamp)
                        lastTimestamp = update.Timestamp;
                }

                await Task.WhenAll(tasks);
                
                if (tasks.Count > 0)
                    Log.Information("Polling for more events");
                
                await Task.Delay(2000);
            }
        }
    }
}