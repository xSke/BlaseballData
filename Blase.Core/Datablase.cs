using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Driver;
using Serilog;

namespace Blase.Core
{
    public class Datablase
    {
        private MongoClient _client;
        private IMongoDatabase _db;
        private IMongoCollection<GameUpdate> _gameUpdates;
        private IMongoCollection<RawUpdate> _rawUpdates;
        private IMongoCollection<IdolsUpdate> _idolUpdates;
        private IMongoCollection<TeamUpdate> _teamUpdates;
        private IMongoCollection<PlayerUpdate> _playerUpdates;
        private IMongoCollection<JsUpdate> _jsUpdates;
        private IMongoCollection<Game> _games;

        public Datablase()
        {
            var connection = Environment.GetEnvironmentVariable("DATABLASE_URI");
            if (connection == null)
                throw new Exception("Need mongodb URI in DATABLASE_URI env...");

            _client = new MongoClient(connection);
            _db = _client.GetDatabase("blaseball");

            _games = _db.GetCollection<Game>("games2");
            _gameUpdates = _db.GetCollection<GameUpdate>("gameupdates2");
            _rawUpdates = _db.GetCollection<RawUpdate>("rawupdates2");
            _idolUpdates = _db.GetCollection<IdolsUpdate>("idols");
            _teamUpdates = _db.GetCollection<TeamUpdate>("teams");
            _playerUpdates = _db.GetCollection<PlayerUpdate>("players");
            _jsUpdates = _db.GetCollection<JsUpdate>("js");

            _games.Indexes.CreateOne(new CreateIndexModel<Game>("{ season: 1, day: 1 }"));
            _games.Indexes.CreateOne(new CreateIndexModel<Game>("{ season: -1, day: -1 }"));
            _gameUpdates.Indexes.CreateOne(new CreateIndexModel<GameUpdate>("{ game: 1, firstSeen: 1 }"));
        }
        public async Task WriteGameSummaries(IReadOnlyCollection<GameUpdate> updates)
        {
            await _games.BulkWriteAsync(updates.Select(update =>
            {
                var filter = Builders<Game>.Filter.Eq(x => x.Id, update.GameId);
                var model = Builders<Game>.Update
                    .SetOnInsert(x => x.Id, update.GameId)
                    .Set(x => x.Season, update.Payload["season"].AsInt32)
                    .Set(x => x.Day, update.Payload["day"].AsInt32)
                    .Set(x => x.LastUpdate, update.Payload)
                    .Max(x => x.LastUpdateTime, update.FirstSeen);

                if (update.Payload["gameStart"].AsBoolean)
                    model = model.Min(x => x.Start, update.FirstSeen);
                if (update.Payload["gameComplete"].AsBoolean)
                    model = model.Min(x => x.End, update.LastSeen);

                return new UpdateOneModel<Game>(filter, model) {IsUpsert = true};
            }));
        }

        public async Task UpdateGameIndex()
        {
            Log.Information("Reindexing game collection");
            await _gameUpdates.Aggregate(new AggregateOptions { AllowDiskUse = true })
                .Sort("{firstSeen: 1}")
                .Group(@"{
                    _id: '$game',
                    season: {$first: '$payload.season'},
                    day: {$first: '$payload.day'},
                    lastUpdate: {$last: '$payload'},
                    lastUpdateTime: {$last: '$firstSeen'}
                }")
                .MergeAsync(_games);

            Log.Information("Reindexing game start timestamps");
            await _gameUpdates.Aggregate(new AggregateOptions { AllowDiskUse = true })
                .Match("{'payload.gameStart': true}")
                .Group(@"{
                    _id: '$game',
                    start: {$min: '$firstSeen'},
                }")
                .MergeAsync(_games);
            
            Log.Information("Reindexing game end timestamps");
            await _gameUpdates.Aggregate(new AggregateOptions { AllowDiskUse = true })
                .Match("{'payload.gameComplete': true}")
                .Group(@"{
                    _id: '$game',
                    end: {$min: '$firstSeen'},
                }")
                .MergeAsync(_games);

            Log.Information("Done! :)");
        }

        public async Task WriteGameUpdates(IReadOnlyCollection<GameUpdate> updates)
        {
            await _gameUpdates.BulkWriteAsync(updates.Select(update =>
            {
                var filter = Builders<GameUpdate>.Filter.Eq(x => x.Id, update.Id);
                var model = Builders<GameUpdate>.Update
                    .SetOnInsert(x => x.GameId, update.GameId)
                    .SetOnInsert(x => x.Payload, update.Payload)
                    .Min(x => x.FirstSeen, update.FirstSeen)
                    .Max(x => x.LastSeen, update.LastSeen);
                
                return new UpdateOneModel<GameUpdate>(filter, model) {IsUpsert = true};
            }));
        }

        public async Task WriteRaw(RawUpdate update)
        {
            var filter = Builders<RawUpdate>.Filter.Eq(x => x.Id, update.Id);
            
            var model = Builders<RawUpdate>.Update
                .SetOnInsert(x => x.Payload, update.Payload)
                .Min(x => x.FirstSeen, update.FirstSeen)
                .Max(x => x.LastSeen, update.LastSeen);
            await _rawUpdates.UpdateOneAsync(filter, model, new UpdateOptions { IsUpsert = true });
        }

        public IAsyncEnumerable<GameUpdate> GetGameUpdates(Guid? gameId, DateTimeOffset after)
        {
            var builder = Builders<GameUpdate>.Filter;
            var filter = builder.Gt(u => u.FirstSeen, after);
            if (gameId != null)
                filter &= builder.Eq(u => u.GameId, gameId.Value);

            return _gameUpdates.FindAsync(
                filter,
                new FindOptions<GameUpdate>
                {
                    Sort = Builders<GameUpdate>.Sort.Ascending(u => u.FirstSeen),
                    BatchSize = 25
                }
            ).ToAsyncEnumerable();
        }

        public class GameDay
        {
            public int Season;
            public int Day;
            public Game[] Games;
            public DateTimeOffset? Start;
        }

        public IAsyncEnumerable<GameDay> GetGamesByDay(int season, int dayStart, bool reverse)
        {
            var filter = reverse
                ? Builders<Game>.Filter.Lte(x => x.Day, dayStart)
                : Builders<Game>.Filter.Gte(x => x.Day, dayStart);
            filter &= Builders<Game>.Filter.Eq(x => x.Season, season);
            
            var sort = reverse
                ? Builders<GameDay>.Sort.Descending(x => x.Season).Descending(x => x.Day)
                : Builders<GameDay>.Sort.Ascending(x => x.Season).Ascending(x => x.Day);
            
            return _games.Aggregate()
                .Match(filter)
                .Group(@"{
                    _id: {
                        Season: '$season',
                        Day: '$day'
                    },
                    Season: {$min: '$season'},
                    Day: {$min: '$day'},
                    Games: {$push: '$$ROOT'},
                    Start: {$min: '$start'}
                }")
                .AppendStage<GameDay>("{$unset: '_id'}")
                .Sort(sort)
                .ToCursorAsync()
                .ToAsyncEnumerable();
        }

        public IAsyncEnumerable<RawUpdate> GetRawUpdates(DateTimeOffset after, int? season = null)
        {
            var filter = Builders<RawUpdate>.Filter.Gt(x => x.FirstSeen, after);
            if (season != null)
                filter &= Builders<RawUpdate>.Filter.Eq("payload.value.games.sim.season", season);
            
            var sort = Builders<RawUpdate>.Sort.Ascending(x => x.FirstSeen);
            return _rawUpdates.FindAsync(filter, new FindOptions<RawUpdate>
                {
                    Sort = sort,
                })
                .ToAsyncEnumerable();
        }

        public async Task WriteIdolsUpdate(IdolsUpdate update)
        {
            var filter = Builders<IdolsUpdate>.Filter.Eq(x => x.Id, update.Id);
            
            var model = Builders<IdolsUpdate>.Update
                .SetOnInsert(x => x.Payload, update.Payload)
                .Min(x => x.FirstSeen, update.FirstSeen)
                .Max(x => x.LastSeen, update.LastSeen);
            await _idolUpdates.UpdateOneAsync(filter, model, new UpdateOptions { IsUpsert = true });
        }

        public async Task WriteTeamUpdates(TeamUpdate[] updates)
        {
            await _teamUpdates.BulkWriteAsync(updates.Select(update =>
            {
                var filter = Builders<TeamUpdate>.Filter.Eq(x => x.Id, update.Id);
                var model = Builders<TeamUpdate>.Update
                    .SetOnInsert(x => x.TeamId, update.TeamId)
                    .SetOnInsert(x => x.Payload, update.Payload)
                    .Min(x => x.FirstSeen, update.FirstSeen)
                    .Max(x => x.LastSeen, update.LastSeen);
                
                return new UpdateOneModel<TeamUpdate>(filter, model) {IsUpsert = true};
            }));
        }
        
        public async Task WritePlayerUpdates(PlayerUpdate[] updates)
        {
            await _playerUpdates.BulkWriteAsync(updates.Select(update =>
            {
                var filter = Builders<PlayerUpdate>.Filter.Eq(x => x.Id, update.Id);
                var model = Builders<PlayerUpdate>.Update
                    .SetOnInsert(x => x.PlayerId, update.PlayerId)
                    .SetOnInsert(x => x.Payload, update.Payload)
                    .Min(x => x.FirstSeen, update.FirstSeen)
                    .Max(x => x.LastSeen, update.LastSeen);
                
                return new UpdateOneModel<PlayerUpdate>(filter, model) {IsUpsert = true};
            }));
        }

        public async Task WriteJsUpdate(JsUpdate update)
        {
            var filter = Builders<JsUpdate>.Filter.Eq(x => x.Id, update.Id);

            var model = Builders<JsUpdate>.Update
                .SetOnInsert(x => x.Content, update.Content)
                .SetOnInsert(x => x.Url, update.Url)
                .Min(x => x.FirstSeen, update.FirstSeen)
                .Max(x => x.LastSeen, update.LastSeen);
            await _jsUpdates.UpdateOneAsync(filter, model, new UpdateOptions { IsUpsert = true });
        }
    }
}