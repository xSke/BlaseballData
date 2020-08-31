using System;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;
using Serilog;

namespace Blase.Ingest
{
    public class EventStream
    {
        private const string StripPrefix = "data: ";
        
        private readonly HttpClient _client;
        private readonly ILogger _logger;

        public EventStream(HttpClient client, ILogger logger)
        {
            _client = client;
            _logger = logger;
        }

        public async Task Stream(string url, Action<string> callback)
        {
            while (true)
            {
                try
                {
                    _logger.Information("Connecting to stream URL {Url}", url);
                    await using var stream = await _client.GetStreamAsync(url);
                    var reader = new StreamReader(stream);
                    
                    _logger.Information("Connected to stream, receiving...");

                    string str;
                    while ((str = await reader.ReadLineAsync()) != null)
                    {
                        if (string.IsNullOrWhiteSpace(str))
                            continue;

                        if (!str.StartsWith(StripPrefix))
                            continue;

                        callback(str.Substring(StripPrefix.Length));
                    }
                }
                catch (Exception e)
                {
                    _logger.Error(e, "Error while processing stream");
                }
            }
        }
    }
}