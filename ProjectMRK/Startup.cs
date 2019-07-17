using Microsoft.Extensions.Configuration;

namespace ProjectMRK
{
    public class Startup : AWMSEngine.Startup
    {
        public Startup(IConfiguration configuration) : base(configuration)
        {
        }
    }
}