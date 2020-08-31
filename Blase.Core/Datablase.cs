using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;
using MongoDB.Driver;

namespace Blase.Core
{
    public class Datablase
    {
        private MongoClient _client;
        private IMongoDatabase _db;
        private IMongoCollection<GameUpdate> _gameUpdates;
        private IMongoCollection<RawUpdate> _rawUpdates;
        private IMongoCollection<Game> _games;

        public Datablase()
        {
            var connection = Environment.GetEnvironmentVariable("DATABLASE_URI");
            if (connection == null)
                throw new Exception("Need mongodb URI in DATABLASE_URI env...");
            
            BsonSerializer.RegisterSerializer(new GuidSerializer(BsonType.String));
            BsonSerializer.RegisterSerializer(typeof(DateTimeOffset), new DateTimeUtcSerializer());

            _client = new MongoClient(connection);
            _db = _client.GetDatabase("blaseball");

            _games = _db.GetCollection<Game>("games");
            _gameUpdates = _db.GetCollection<GameUpdate>("gameupdates");
            _rawUpdates = _db.GetCollection<RawUpdate>("rawupdates");

            CreateIndices();
        }

        private void CreateIndices()
        {
            _gameUpdates
                .Indexes.CreateMany(new[]
                {
                    new CreateIndexModel<GameUpdate>(Builders<GameUpdate>.IndexKeys.Ascending("timestamp")),
                    new CreateIndexModel<GameUpdate>(Builders<GameUpdate>.IndexKeys.Hashed(x => x.Hash)),
                    new CreateIndexModel<GameUpdate>(Builders<GameUpdate>.IndexKeys.Hashed(x => x.GameId)),
                    new CreateIndexModel<GameUpdate>("{'payload.season': 1, 'payload.day': 1}")
                });

            _rawUpdates
                .Indexes.CreateMany(new[]
                {
                    new CreateIndexModel<RawUpdate>(
                        Builders<RawUpdate>.IndexKeys.Ascending("timestamp")),
                    new CreateIndexModel<RawUpdate>(Builders<RawUpdate>.IndexKeys.Hashed(x => x.Hash)),
                });
        }

        public async Task WriteGameSummaries(IReadOnlyCollection<GameUpdate> updates)
        {
            await _games.BulkWriteAsync(updates.Select(update =>
            {
                var filter = Builders<Game>.Filter.Eq(u => u.Id, update.GameId);
                var model = Builders<Game>.Update
                    .SetOnInsert(x => x.Id, update.GameId)
                    .SetOnInsert(x => x.Season, update.Season)
                    .SetOnInsert(x => x.Day, update.Day)
                    .Set(x => x.LastUpdate, update.Payload)
                    .Set(x => x.LastUpdateHash, update.Hash)
                    .Min(x => x.Start, update.Timestamp);
                
                if (update.Payload.Contains("gameComplete"))
                    model = model.Min(x => x.End, update.Timestamp);

                return new UpdateOneModel<Game>(filter, model) {IsUpsert = true};
            }));
        }

        public async Task UpdateGameIndex()
        {
            var def = PipelineDefinition<GameUpdate, Game>.Create(
                "{$sort: {timestamp: 1}}",
                @"
                {
                    $group: {
                        _id: '$game_id',
                        start: {$first: '$timestamp'},
                        end: {$last: '$timestamp'},
                        season: {$first: '$payload.season'},
                        day: {$first: '$payload.day'},
                        last_update: {$last: '$payload'},
                        last_update_hash: {$last: '$hash'}
                    }
                }", 
                "{$merge: {into: 'games'}}"
            );
            await _gameUpdates.AggregateAsync(def);
        }

        public async Task WriteGameUpdates(IReadOnlyCollection<GameUpdate> updates)
        {
            await _gameUpdates.BulkWriteAsync(updates.Select(update =>
            {
                var builder = Builders<GameUpdate>.Filter;
                var filter = builder.Eq(u => u.Hash, update.Hash) &
                             builder.Eq(u => u.GameId, update.GameId);

                var model = Builders<GameUpdate>.Update
                    .SetOnInsert(x => x.Hash, update.Hash)
                    .SetOnInsert(x => x.GameId, update.GameId)
                    .SetOnInsert(x => x.Payload, update.Payload)
                    .SetOnInsert(x => x.Season, update.Season)
                    .SetOnInsert(x => x.Day, update.Day)
                    .Min(x => x.Timestamp, update.Timestamp);
                return new UpdateOneModel<GameUpdate>(filter, model) {IsUpsert = true};
            }));
        }

        public async Task WriteRaw(RawUpdate update)
        {
            var builder = Builders<RawUpdate>.Filter;
            var filter = builder.Eq(u => u.Hash, update.Hash);

            var model = Builders<RawUpdate>.Update
                .SetOnInsert(x => x.Hash, update.Hash)
                .SetOnInsert(x => x.Payload, update.Payload)
                .Min(x => x.Timestamp, update.Timestamp);
            await _rawUpdates.UpdateOneAsync(filter, model, new UpdateOptions { IsUpsert = true });
        }

        public async IAsyncEnumerable<GameUpdate> QueryGameUpdatesFor(Guid gameId)
        {
            var builder = Builders<GameUpdate>.Filter;
            var filter = builder.Eq(x => x.GameId, gameId);
            
            using var cursor = await _gameUpdates.FindAsync(filter, new FindOptions<GameUpdate>
            {
                Sort = Builders<GameUpdate>.Sort.Ascending(x => x.Timestamp)
            });
            while (await cursor.MoveNextAsync())
                foreach (var upd in cursor.Current)
                    yield return upd;
        }
        
        public async IAsyncEnumerable<GameUpdate> QueryGameUpdatesSince(DateTimeOffset last)
        {
            var builder = Builders<GameUpdate>.Filter;
            var filter = builder.Gt(x => x.Timestamp, last.UtcDateTime);

            using var cursor = await _gameUpdates.FindAsync(filter, new FindOptions<GameUpdate>
            {
                Sort = Builders<GameUpdate>.Sort.Ascending(x => x.Timestamp)
            });
            
            while (await cursor.MoveNextAsync())
                foreach (var upd in cursor.Current)
                    yield return upd;
        }

        public async IAsyncEnumerable<Game> QueryGamesInSeason(int season)
        {
            using var cursor = await _games.FindAsync(Builders<Game>.Filter.Eq(x => x.Season, season));

            while (await cursor.MoveNextAsync())
                foreach (var upd in cursor.Current)
                    yield return upd;
        }
    }
}