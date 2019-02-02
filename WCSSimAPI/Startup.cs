using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
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
            //AMWUtil.Common.SchedulerUtil.Start<WMS_RegisterJobs>(ConstConfig.CronEx);
            //AMWUtil.Common.SchedulerUtil.Start<WMS_WorkingJobs>(ConstConfig.CronEx);
            //AMWUtil.Common.SchedulerUtil.Start<WMS_DoneJobs>(ConstConfig.CronEx);
            //AMWUtil.Common.SchedulerUtil.Start<WMS_LocationInfoJobs>(ConstConfig.CronEx);

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
            Task.Run(() =>
            {
                while (true)
                {
                    jobRegister.Execute(null);
                    jobDone.Execute(null);
                    jobWorking.Execute(null);
                    //jobLocationInfo.Execute(null);
                    Thread.Sleep(1000);
                }
            });
        }
    }

}
