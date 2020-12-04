using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using SyncApi_WCS_LN.ADO;
using SyncApi_WCS_LN.WorkerService;

namespace SyncApi_WCS_LN
{
    public class Startup
    {
        // This method gets called by the runtime. Use this method to add services to the container.
        // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
        public void ConfigureServices(IServiceCollection services)
        {
            AMWUtil.Logger.AMWLoggerManager.InitInstant("D:/logs/wcs_ptt/{Date}/", "{LogName}.{Date}.log");

            using (StreamReader sr = new StreamReader("app.property"))
            {
                while (sr.EndOfStream == false)
                {
                    string line = sr.ReadLine();
                    if (string.IsNullOrWhiteSpace(line) || line.Trim().StartsWith("#") || line.IndexOf("=") < 0) 
                        continue;

                    string[] kv = line.Split("=", 2);
                    string k = kv[0].Trim();
                    string v = kv[1].Trim();
                    if (k.ToLower().StartsWith("database."))
                        ConfigADO.DatatbaseConfigs.Add(k, v);
                    else if (k.ToLower().StartsWith("post2wms."))
                        ConfigADO.Post2wmsConfigs.Add(k.ToLower(), v);
                    else if (k.ToLower().StartsWith("controller."))
                        ConfigADO.Post2wmsConfigs.Add(k.ToLower(), v);
                }
            }

            services.AddHostedService<WorkerSetup>();

        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseRouting();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapGet("/", async context =>
                {
                    await context.Response.WriteAsync("Hello World!");
                });
            });
        }
    }
}
