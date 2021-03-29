using AMSModel.Constant.StringConst;
using AMWUtil.PropertyFile;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWCSWebApp
{
    public class Program
    {
        public static void Main(string[] args)
        {
            PropertyFileManager.GetInstant().AddPropertyFile(PropertyConst.APP_KEY, PropertyConst.APP_FILENAME);
            var appProperty = PropertyFileManager.GetInstant().Get(PropertyConst.APP_KEY);

            AMWUtil.Logger.AMWLoggerManager.InitInstant(
                appProperty[PropertyConst.APP_KEY_LOG_ROOTPATH],
                appProperty[PropertyConst.APP_KEY_LOG_FILENAME]);

            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });
    }
}
