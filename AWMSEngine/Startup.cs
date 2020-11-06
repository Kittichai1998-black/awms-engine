using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using AMWUtil.Common;
using AMWUtil.PropertyFile;
using AWMSEngine.HubService;
using AWMSEngine.WorkerService;
using AWMSModel.Constant.StringConst;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Hosting;
using Newtonsoft.Json.Serialization;
using Microsoft.AspNetCore.Mvc.NewtonsoftJson;
using Quartz;
using Microsoft.AspNetCore.Routing;
using AWMSEngine.Common;
using AWMSEngine.ScheduleService;
using DinkToPdf.Contracts;
using DinkToPdf;
using System.IO;
using AMWUtil.Logger;

namespace AWMSEngine
{
    public class Startup
    {
        private AMWLogger Logger { get; set; }
        private IConfiguration Configuration { get; }

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            PropertyFileManager.GetInstant().AddPropertyFile(PropertyConst.APP_KEY, PropertyConst.APP_FILENAME);
            var appProperty = PropertyFileManager.GetInstant().Get(PropertyConst.APP_KEY);
            
            AMWUtil.Logger.AMWLoggerManager.InitInstant(
                appProperty[PropertyConst.APP_KEY_LOG_ROOTPATH],
                appProperty[PropertyConst.APP_KEY_LOG_FILENAME]);
            this.Logger = AMWUtil.Logger.AMWLoggerManager.GetLogger("server", "server");

            try
            {
                this.Logger.LogInfo("########### BEGIN START_SERVER ###########");
                this.Logger.LogInfo("----------- BEGIN ConfigureServices -----------");
                this.Logger.LogInfo("StaticValueManager.GetInstant().LoadAll()");
                ADO.WMSStaticValue.StaticValueManager.GetInstant().LoadAll();
                this.Logger.LogInfo("services.AddCors()");
                services.AddCors(options =>
                {
                    options.AddPolicy("AllowCors", builder =>
                    {
                        builder
                        .AllowAnyOrigin()
                        //.WithMethods("GET", "PUT", "POST", "DELETE")
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        //.AllowCredentials()
                        .WithExposedHeaders("x-custom-header");
                    });
                });

                
                services.AddRazorPages();
                this.Logger.LogInfo("services.AddRazorPages()");
                services.AddMvc().AddNewtonsoftJson(options => options.SerializerSettings.ContractResolver = new DefaultContractResolver());
                this.Logger.LogInfo("services.AddMvc().AddNewtonsoftJson()");
                services.AddSignalR();
                this.Logger.LogInfo("services.AddSignalR()");
                services.AddSingleton(typeof(IConverter), new SynchronizedConverter(new PdfTools()));
                this.Logger.LogInfo("services.AddSingleton()");
                services.AddControllers();
                this.Logger.LogInfo("services.AddControllers()");
                this.SetUpScheduler();
                this.Logger.LogInfo("SetUpScheduler()");
                this.SetUpWorker(services);
                this.Logger.LogInfo("SetUpWorker()");
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex.Message);
                this.Logger.LogError(ex.StackTrace);
                return;
            }
            finally
            {
                this.Logger.LogInfo("----------- END ConfigureServices -----------");
            }
        }
        private void OnStopping()
        {
            this.Logger.LogInfo("#####################################");
            this.Logger.LogInfo("########### STOPING_SERVER ##########");
            this.Logger.LogInfo("#####################################");
        }
        private void OnStopped()
        {
            this.Logger.LogInfo("#####################################");
            this.Logger.LogInfo("########### STOPED_SERVER ###########");
            this.Logger.LogInfo("#####################################");
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        [Obsolete]
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, Microsoft.AspNetCore.Hosting.IApplicationLifetime appLifetime)
        {
            try
            {
                appLifetime.ApplicationStopping.Register(OnStopping);
                appLifetime.ApplicationStopped.Register(OnStopped);

                this.Logger.LogInfo("----------- BEGIN Configure -----------");
                if (env.IsDevelopment())
                {
                    this.Logger.LogInfo("app.UseDeveloperExceptionPage()");
                    app.UseDeveloperExceptionPage();
                }
                else
                {
                    this.Logger.LogInfo("app.UseHsts()");
                    app.UseHsts();
                }

                this.Logger.LogInfo("app.UseRouting()");
                app.UseRouting();
                this.Logger.LogInfo("app.UseCors()");
                app.UseCors("AllowCors");
                this.Logger.LogInfo("app.UseHsts()");
                app.UseHttpsRedirection();
                this.Logger.LogInfo("app.UseStaticFiles()");
                app.UseStaticFiles();
                this.Logger.LogInfo("SetUpHub()");
                this.SetUpHub(app);

                this.Logger.LogInfo("app.UseEndpoints()");
                app.UseEndpoints(endpoint =>
                {
                    endpoint.MapControllers();
                });
            }
            catch(Exception ex)
            {
                this.Logger.LogError(ex.Message);
                this.Logger.LogError(ex.StackTrace);
                return;
            }
            finally
            {
                this.Logger.LogInfo("----------- END Configure -----------");
                this.Logger.LogInfo("########### END START_SERVER ###########");
            }

        }


        private void SetUpWorker(IServiceCollection services)
        {
            /*var workers = ADO.StaticValue.StaticValueManager.GetInstant().WorkerService;
            foreach (var wk in workers)
            {
                BaseWorkerService.AddJobWorkerSetup(wk);

                string workerClassName = wk.FullClassName;
                var t = AMWUtil.Common.ClassType.GetClassType(workerClassName);
                MethodInfo m1 = typeof(ServiceCollectionHostedServiceExtensions).GetMethod("AddHostedService", new Type[] { typeof(IServiceCollection) });
                var m2 = m1.MakeGenericMethod(t);
                IServiceCollection w = (IServiceCollection)m2.Invoke(null, new object[] { services });
            }*/
            services.AddHostedService<StartupWorkerService>();
        }
        private void SetUpHub(IApplicationBuilder app)
        {
            var hubs = ADO.WMSStaticValue.StaticValueManager.GetInstant().HubService;

            app.UseEndpoints(routes =>
            {
                foreach (var hb in hubs)
                {
                    string hubURL = hb.Url;
                    string hubClassName = hb.FullClassName;
                    var t = AMWUtil.Common.ClassType.GetClassType(hubClassName);
                    var m1 = typeof(HubEndpointRouteBuilderExtensions).GetMethod("MapHub", new Type[] { typeof(IEndpointRouteBuilder), typeof(string) });
                    var m2 = m1.MakeGenericMethod(t);
                    m2.Invoke(routes, new object[] { routes, new string(hubURL) });
                }
            });

        }
        private void SetUpScheduler()
        {
            var jobs = ADO.WMSStaticValue.StaticValueManager.GetInstant().ScheduleService;
            foreach (var jb in jobs)
            {
                BaseScheduleService.AddScheduleServiceSetup(jb);

                string jobCronex = jb.CronExpressions;
                string jobClassName = jb.FullClassName;
                var tJob = AMWUtil.Common.ClassType.GetClassType(jobClassName);
                IJobDetail w = SchedulerUtil.Start(tJob, jobCronex, new KeyValuePair<string, object>("ScheduleServiceID", jb.ID.Value));
            }
        }
        
    }
}
