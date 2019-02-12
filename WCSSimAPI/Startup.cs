using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AMWUtil.Logger;
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

            //PropertyFileManager.GetInstant().AddPropertyFile("app", env.ContentRootPath + "/app.conf");
            //var appProperty = PropertyFileManager.GetInstant().GetPropertyDictionary("app");

            //ConstConfig.DBConnection = appProperty.GetValueOrDefault("DBConnection");
            //ConstConfig.CronEx = appProperty.GetValueOrDefault("CronEx");
            //ConstConfig.WMSApiURL = appProperty.GetValueOrDefault("WMSApiURL");

            //string logPath = appProperty.GetValueOrDefault("logger.rootpath");
            //string logFile = appProperty.GetValueOrDefault("logger.filename");


            /*AMWUtil.Logger.AMWLoggerManager.InitInstant(@"D:/wcs_log/{Date}/",@"{ServiceName}.{Date}.log");
            using(System.IO.StreamWriter fw = new System.IO.StreamWriter(@"D:\test.log"))
            {
                fw.WriteLine("TEST::" + DateTime.Now);
            }
            var logStartUp = AMWLoggerManager.GetLogger("Start Up");
            logStartUp.LogInfo("##################");
            logStartUp.LogInfo("DBConnection : " + ConstConfig.DBConnection);
            logStartUp.LogInfo("CronEx : " + ConstConfig.CronEx);
            logStartUp.LogInfo("WMSApiURL : " + ConstConfig.WMSApiURL);*/
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

            AMWLogger registerLog = null;// AMWUtil.Logger.AMWLoggerManager.GetLogger("RegisterQueue");
            AMWLogger workingLog = null;// AMWUtil.Logger.AMWLoggerManager.GetLogger("WorkingQueue");
            AMWLogger doneLog = null;// AMWUtil.Logger.AMWLoggerManager.GetLogger("DoneQueue");
            AMWLogger locationLog = null;// AMWUtil.Logger.AMWLoggerManager.GetLogger("LocationInfoQueue");


            /*var logStartUp = AMWLoggerManager.GetLogger("Start Up");
            logStartUp.LogInfo("##################");
            logStartUp.LogInfo("DBConnection : " + ConstConfig.DBConnection);
            logStartUp.LogInfo("CronEx : " + ConstConfig.CronEx);
            logStartUp.LogInfo("WMSApiURL : " + ConstConfig.WMSApiURL);*/

            Task.Run(() =>
            {
                while (true)
                {
                    StatusController.registerQueueStatus = jobRegister.Execute(registerLog);
                    Thread.Sleep(1000);
                }
            });
            Task.Run(() =>
            {
                while (true)
                {
                    StatusController.workingQueueStatus = jobWorking.Execute(workingLog);
                    Thread.Sleep(1000);
                }
            });
            Task.Run(() =>
            {
                while (true)
                {
                    StatusController.doneQueueStatus = jobDone.Execute(doneLog);
                    Thread.Sleep(1000);
                }
            });
            Task.Run(() =>
            {
                while (true)
                {
                    StatusController.locationInfoQueueStatus = jobLocationInfo.Execute(locationLog);
                    Thread.Sleep(1000);
                }
            });
        }
    }

}
