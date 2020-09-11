using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Text.RegularExpressions;
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
            await new Program().Run();
        }
        
        private readonly Datablase _db;
        private readonly HttpClient _client;
        
        public Program()
        {
            _db = new Datablase();
            _client = new HttpClient();
        }
        
        public async Task Run()
        {
            Log.Information("Starting! :)");
            var streamTask = StreamDataIngestWorker();
            var idolTask = IdolDataIngestWorker();
            var teamPlayerTask = TeamPlayerDataIngestWorker();
            var jsTask = JsDataIngestWorker();
            await Task.WhenAll(streamTask, idolTask, teamPlayerTask, jsTask);
        }

        private async Task StreamDataIngestWorker()
        {
            async Task Callback(string obj)
            {
                var timestamp = DateTimeOffset.UtcNow;

                var doc = JsonDocument.Parse(obj);
                await SaveRawPayload(timestamp, doc);
                await SaveGamesPayload(timestamp, doc);
            }

            try
            {

                var stream = new EventStream(_client, Log.Logger);
                await stream.Stream("https://www.blaseball.com/events/streamData", async obj =>
                {
                    try
                    {
                        await Callback(obj);
                    }
                    catch (Exception e)
                    {
                        Log.Error(e, "Error processing stream line");
                    }
                });
            }
            catch (Exception e)
            {
                Log.Error(e, "More try/catch blocks? why not! (something stream data error...)");
            }
        }
        
        private async Task SaveGamesPayload(DateTimeOffset timestamp, JsonDocument doc)
        {
            var scheduleElem = ExtractSchedule(doc.RootElement);
            if (scheduleElem == null)
                return;

            var games = scheduleElem.Value.EnumerateArray()
                .Select(u => ParseUpdate(timestamp, u))
                .Where(u => u != null)
                .ToArray();

            await _db.WriteGameUpdates(games);
            await _db.WriteGameSummaries(games);
            foreach (var gameUpdate in games)
                Log.Information("Saved game update {PayloadHash} (game {GameId})", gameUpdate.Id, gameUpdate.GameId);
        }

        private async Task SaveRawPayload(DateTimeOffset timestamp, JsonDocument doc)
        {
            var update = new RawUpdate(timestamp, doc.RootElement);
            await _db.WriteRaw(update);
            Log.Information("Saved raw event {PayloadHash} at {Timestamp}", update.Id, timestamp);
        }
        
        private async Task TeamPlayerDataIngestWorker()
        {
            while (true)
            {
                try
                {
                    var teams = await FetchAndSaveTeamData();
                    await FetchAndSavePlayerData(teams);
                }
                catch (Exception e)
                {
                    Log.Error(e, "Error processing player data");
                }

                var currentTime = DateTimeOffset.Now;
                var currentMinuteSpan = TimeSpan.FromMinutes(currentTime.Minute % 5)
                    .Add(TimeSpan.FromSeconds(currentTime.Second))
                    .Add(TimeSpan.FromMilliseconds(currentTime.Millisecond));
                
                var delayTime = TimeSpan.FromMinutes(5) - currentMinuteSpan;
                await Task.Delay(delayTime);
            }
        }

        private async Task<TeamUpdate[]> FetchAndSaveTeamData()
        {
            await using var stream = await _client.GetStreamAsync("https://www.blaseball.com/database/allTeams");
            var timestamp = DateTimeOffset.UtcNow;
            var json = await JsonDocument.ParseAsync(stream);

            var updates = json.RootElement.EnumerateArray()
                .Select(u => new TeamUpdate(timestamp, u))
                .ToArray();
            await _db.WriteTeamUpdates(updates);
            Log.Information("Saved {TeamCount} teams at {Timestamp}", updates.Length, timestamp);
            return updates;
        }

        private async Task FetchAndSavePlayerData(TeamUpdate[] teamUpdates)
        {
            var players = teamUpdates.SelectMany(GetTeamPlayers).ToArray();

            var chunks = new List<List<Guid>> {new List<Guid>()};
            foreach (var player in players)
            {
                if (chunks.Last().Count >= 100)
                    chunks.Add(new List<Guid>());
                
                chunks.Last().Add(player);
            }
            
            foreach (var chunk in chunks)
            {
                var ids = string.Join(',', chunk);
                await using var stream = await _client.GetStreamAsync("https://www.blaseball.com/database/players?ids=" + ids);
                
                var timestamp = DateTimeOffset.UtcNow;
                
                var json = await JsonDocument.ParseAsync(stream);
                var updates = json.RootElement.EnumerateArray()
                    .Select(u => new PlayerUpdate(timestamp, u))
                    .ToArray();
                
                await _db.WritePlayerUpdates(updates);
                Log.Information("Saved {PlayerCount} players at {Timestamp}", chunk.Count, timestamp);
            }
        }

        private Guid[] GetTeamPlayers(TeamUpdate teamUpdate)
        {
            var lineup = teamUpdate.Payload["lineup"].AsBsonArray.Select(x => x.AsGuidString());
            var rotation = teamUpdate.Payload["rotation"].AsBsonArray.Select(x => x.AsGuidString());
            return lineup.Concat(rotation).ToArray();
        }

        private async Task IdolDataIngestWorker()
        {
            while (true)
            {
                try
                {
                    await using var resp = await _client.GetStreamAsync("https://www.blaseball.com/api/getIdols");
                    var timestamp = DateTimeOffset.UtcNow;
                    var json = await JsonDocument.ParseAsync(resp);

                    var update = new IdolsUpdate(timestamp, json.RootElement);
                    await _db.WriteIdolsUpdate(update);
                    Log.Information("Saved idols update {PayloadHash} at {Timestamp}", update.Id, timestamp);
                }
                catch (Exception e)
                {
                    Log.Error(e, "Error processing idol data");
                }

                var currentTime = DateTimeOffset.Now;
                var currentMinuteSpan = TimeSpan.FromSeconds(currentTime.Second)
                    .Add(TimeSpan.FromMilliseconds(currentTime.Millisecond));
                var delayTime = TimeSpan.FromMinutes(1) - currentMinuteSpan;
                await Task.Delay(delayTime);
            }
        }
        
        private static GameUpdate ParseUpdate(DateTimeOffset timestamp, JsonElement gameObject)
        {
            var gameUpdate = new GameUpdate(timestamp, gameObject);
            return gameUpdate;
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

        private async Task JsDataIngestWorker()
        {
            while (true)
            {
                try
                {
                    var indexPage = await _client.GetStringAsync("https://www.blaseball.com/");
                    var regex = new Regex(@"<(?:script\s+src|link\s+href)=['""](/[^'""]+)");
                    
                    foreach (Match match in regex.Matches(indexPage))
                    {
                        var scriptUrl = match.Groups[1].Value;
                        if (!scriptUrl.EndsWith(".js") && !scriptUrl.EndsWith(".css"))
                            continue;
                        
                        var scriptData = await _client.GetByteArrayAsync("https://www.blaseball.com" + scriptUrl);
                        var update = new JsUpdate(DateTimeOffset.UtcNow, scriptUrl, scriptData);
                        await _db.WriteJsUpdate(update);
                        Log.Information("Logged JS file {JsPath} with hash {JsHash}", update.Url, update.Id);
                    }
                }
                catch (Exception e)
                {
                    Log.Error(e, "Error processing JS data");
                }
                
                var currentTime = DateTimeOffset.Now;
                var currentMinuteSpan = TimeSpan.FromSeconds(currentTime.Second)
                    .Add(TimeSpan.FromMilliseconds(currentTime.Millisecond));
                
                var delayTime = TimeSpan.FromMinutes(1) - currentMinuteSpan;
                await Task.Delay(delayTime);
            }
        }

    }
}