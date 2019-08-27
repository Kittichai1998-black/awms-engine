
using Microsoft.Extensions.Configuration;



namespace ProjectPanKan
{
    public class Startup : AWMSEngine.Startup
    {
        public Startup(IConfiguration configuration) : base(configuration)
        {
        }
    }
}
