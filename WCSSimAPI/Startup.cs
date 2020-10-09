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

        static object lockJobs = new object();
        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {

            PropertyFileManager.GetInstant().AddPropertyFile("app", env.ContentRootPath + "/app.conf");
            var appProperty = PropertyFileManager.GetInstant().GetProperty("app");

            ConstConfig.DBConnection = appProperty.GetValueOrDefault("DBConnection");
            ConstConfig.CronEx = appProperty.GetValueOrDefault("CronEx");
            ConstConfig.WMSApiURL = appProperty.GetValueOrDefault("WMSApiURL");

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
            WMS_MoveLocationJobs jobMoveLocation = new WMS_MoveLocationJobs();

            Task.Run(() =>
            {
                while (true)
                {
                    lock (lockJobs)
                    {
                        StatusController.registerQueueStatus = jobRegister.Execute();
                    }
                    Thread.Sleep(1000);
                }
            });
            Thread.Sleep(200);
            Task.Run(() =>
            {
                while (true)
                {
                    lock (lockJobs)
                    {
                        StatusController.workingQueueStatus = jobWorking.Execute();
                    }
                    Thread.Sleep(1000);
                }
            });
            Thread.Sleep(200);
            Task.Run(() =>
            {
                while (true)
                {
                    lock (lockJobs)
                    {
                        StatusController.doneQueueStatus = jobDone.Execute();
                    }
                    Thread.Sleep(1000);
                }
            });
            Thread.Sleep(200);
            Task.Run(() =>
            {
                while (true)
                {
                    lock (lockJobs)
                    {
                        StatusController.locationInfoQueueStatus = jobLocationInfo.Execute();
                    }
                    Thread.Sleep(1000);
                }
            });
            Thread.Sleep(200);
            Task.Run(() =>
            {
                while (true)
                {
                    lock (lockJobs)
                    {
                        StatusController.locationMoveQueueStatus = jobMoveLocation.Execute();
                    }
                    Thread.Sleep(1000);
                }
            });
        }
    }

}
