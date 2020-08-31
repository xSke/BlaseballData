using System;
using System.Linq;
using System.Text.Json;
using MongoDB.Bson;
using Nest;

namespace Blase.Process
{
    public class ElasticGameEvent
    {
        public Id Id { get; set; }
        public DateTimeOffset Timestamp { get; set; }
        public Guid GameId { get; set; }

        public int Season { get; set; }
        public int Day { get; set; }
        public int Weather { get; set; }

        public Guid PitchingTeam { get; set; }
        public Guid BattingTeam { get; set; }
        public Guid HomeTeam { get; set; }
        public Guid AwayTeam { get; set; }
        
        public string PitchingTeamName { get; set; }
        public string BattingTeamName { get; set; }

        public int HomeScore { get; set; }
        public int AwayScore { get; set; }

        public Guid? PitcherId { get; set; }
        public string PitcherName { get; set; }
        public Guid? BatterId { get; set; }
        public string BatterName { get; set; }

        public int Inning { get; set; }
        public bool TopOfInning { get; set; }
        public bool Shame { get; set; }
        public bool GameComplete { get; set; }

        public string Message { get; set; }

        public int Balls { get; set; }
        public int Strikes { get; set; }
        public int Outs { get; set; }

        public Guid?[] PlayersOnBase { get; set; }
        public string[] PlayersOnBaseNames { get; set; }
        public int BaseRunners { get; set; }

        public ElasticGameEvent(DateTimeOffset timestamp, BsonDocument payload, string hash)
        {
            Id = new Id(hash);
            
            Timestamp = timestamp;

            GameId = new Guid(payload[payload.Contains("id") ? "id" : "_id"].AsString);

            Season = payload["season"].AsInt32;
            Day = payload["day"].AsInt32;
            Weather = payload["weather"].AsInt32;

            Inning = payload["inning"].AsInt32;
            TopOfInning = payload["topOfInning"].AsBoolean;
            Shame = payload["shame"].AsBoolean;
            GameComplete = payload["gameComplete"].AsBoolean;

            HomeTeam = new Guid(payload["homeTeam"].AsString);
            AwayTeam = new Guid(payload["awayTeam"].AsString);
            PitchingTeam = TopOfInning ? HomeTeam : AwayTeam;
            BattingTeam = TopOfInning ? AwayTeam : HomeTeam;
            
            PitchingTeamName = payload[TopOfInning ? "homeTeamName" : "awayTeamName"].AsString;
            BattingTeamName = payload[TopOfInning ? "awayTeamName" : "homeTeamName"].AsString;

            HomeScore = payload["homeScore"].AsInt32;
            AwayScore = payload["awayScore"].AsInt32;

            var pitcherElem = payload[TopOfInning ? "awayPitcher" : "homePitcher"];
            if (pitcherElem.IsString && !string.IsNullOrWhiteSpace(pitcherElem.AsString))
                PitcherId = new Guid(pitcherElem.AsString);
            PitcherName = payload[TopOfInning ? "awayPitcherName" : "homePitcherName"].AsString;

            var batterNameValue = payload[TopOfInning ? "awayBatterName" : "homeBatterName"];
            BatterName = batterNameValue.IsBsonNull ? "" : batterNameValue.AsString;
            
            if (BatterName != "")
                BatterId = new Guid(payload[TopOfInning ? "awayBatter" : "homeBatter"].AsString);

            Balls = payload["atBatBalls"].AsInt32;
            Strikes = payload["atBatStrikes"].AsInt32;
            Outs = payload["halfInningOuts"].AsInt32;

            PlayersOnBase = new Guid?[3];
            PlayersOnBaseNames = new string[3];
            var basesOccupied = payload["basesOccupied"].AsBsonArray
                .Select(el => el.AsInt32)
                .ToList();
            for (var i = 0; i < basesOccupied.Count; i++)
            {
                PlayersOnBase[basesOccupied[i]] = new Guid(payload["baseRunners"][i].AsString);
                
                if (payload.Contains("baseRunnerNames"))
                    PlayersOnBaseNames[basesOccupied[i]] = payload["baseRunnerNames"][i].AsString;
            }

            BaseRunners = payload["baserunnerCount"].AsInt32;

            Message = payload["lastUpdate"].AsString;
        }
    }
}