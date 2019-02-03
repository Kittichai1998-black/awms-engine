using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AMWUtil.PropertyFile;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using WCSSimAPI.Controllers;
using WCSSimAPI.Jobs;

namespace WCSSimAPI
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_1);
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {

            PropertyFileManager.GetInstant().AddPropertyFile("app", env.ContentRootPath + "/app.conf");
            var appProperty = PropertyFileManager.GetInstant().GetPropertyDictionary("app");

            ConstConfig.DBConnection = appProperty.GetValueOrDefault("DBConnection");
            ConstConfig.CronEx = appProperty.GetValueOrDefault("CronEx");
            ConstConfig.WMSApiURL = appProperty.GetValueOrDefault("WMSApiURL");

            AMWUtil.Logger.AMWLoggerManager.InitInstant(appProperty.GetValueOrDefault("logger.rootpath"), appProperty.GetValueOrDefault("logger.filename"));

            this.JobRun();

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseMvc();
        }

        private void JobRun()
        {
            WMS_RegisterJobs jobRegister = new WMS_RegisterJobs();
            WMS_DoneJobs jobDone = new WMS_DoneJobs();
            WMS_WorkingJobs jobWorking = new WMS_WorkingJobs();
            WMS_LocationInfoJobs jobLocationInfo = new WMS_LocationInfoJobs();

            var registerLog = AMWUtil.Logger.AMWLoggerManager.GetLogger("RegisterQueue");
            var workingLog = AMWUtil.Logger.AMWLoggerManager.GetLogger("WorkingQueue");
            var doneLog = AMWUtil.Logger.AMWLoggerManager.GetLogger("DoneQueue");
            var locationLog = AMWUtil.Logger.AMWLoggerManager.GetLogger("LocationInfoQueue");
            Task.Run(() =>
            {
                while (true)
                {
                    StatusController.registerQueueStatus = jobRegister.Execute(registerLog);
                    StatusController.workingQueueStatus = jobWorking.Execute(workingLog);
                    StatusController.doneQueueStatus = jobDone.Execute(doneLog);
                    StatusController.locationInfoQueueStatus = jobLocationInfo.Execute(locationLog);
                    Thread.Sleep(1000);
                }
            });
        }
    }

}
