using Serilog;

namespace Blase.Core
{
    public class BlaseCore
    {
        public static void Init()
        {
            Log.Logger = new LoggerConfiguration()
                .WriteTo.Console()
                .CreateLogger();
        }
    }
}