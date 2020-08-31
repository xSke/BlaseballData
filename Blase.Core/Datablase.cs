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

        public Datablase()
        {
            var connection = Environment.GetEnvironmentVariable("DATABLASE_URI");
            if (connection == null)
                throw new Exception("Need mongodb URI in DATABLASE_URI env...");
            
            BsonSerializer.RegisterSerializer(new GuidSerializer(BsonType.String));
            BsonSerializer.RegisterSerializer(typeof(DateTimeOffset), new DateTimeUtcSerializer());

            _client = new MongoClient(connection);
            _db = _client.GetDatabase("admin");

            _gameUpdates = _db.GetCollection<GameUpdate>("gameupdates");
            _rawUpdates = _db.GetCollection<RawUpdate>("rawupdates");

            CreateIndices();
        }

        private void CreateIndices()
        {
            _gameUpdates
                .Indexes.CreateMany(new[]
                {
                    new CreateIndexModel<GameUpdate>(Builders<GameUpdate>.IndexKeys.Ascending(x => x.Timestamp)),
                    new CreateIndexModel<GameUpdate>(Builders<GameUpdate>.IndexKeys.Hashed(x => x.Hash)),
                    new CreateIndexModel<GameUpdate>(Builders<GameUpdate>.IndexKeys.Hashed(x => x.GameId))
                });

            _rawUpdates
                .Indexes.CreateMany(new[]
                {
                    new CreateIndexModel<RawUpdate>(
                        Builders<RawUpdate>.IndexKeys.Ascending(nameof(RawUpdate.Timestamp))),
                    new CreateIndexModel<RawUpdate>(Builders<RawUpdate>.IndexKeys.Hashed(x => x.Hash)),
                });
        }

        public async Task WriteGames(IEnumerable<GameUpdate> updates)
        {
            var builder = Builders<GameUpdate>.Filter;
            var bulk = updates.Select(update =>
            {
                var filter = builder.Eq(u => u.Hash, update.Hash) &
                             builder.Eq(u => u.GameId, update.GameId);

                var model = Builders<GameUpdate>.Update
                    .SetOnInsert(x => x.Hash, update.Hash)
                    .SetOnInsert(x => x.GameId, update.GameId)
                    .SetOnInsert(x => x.Payload, update.Payload)
                    .Min(x => x.Timestamp, update.Timestamp);
                return new UpdateOneModel<GameUpdate>(filter, model) {IsUpsert = true};
            });

            await _gameUpdates.BulkWriteAsync(bulk);
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
            {
                foreach (var upd in cursor.Current)
                    yield return upd;
            }
        }
    }
}