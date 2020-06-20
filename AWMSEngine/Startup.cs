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

namespace AWMSEngine
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
            PropertyFileManager.GetInstant().AddPropertyFile(PropertyConst.APP_KEY, PropertyConst.APP_FILENAME);
            var appProperty = PropertyFileManager.GetInstant().GetPropertyDictionary(PropertyConst.APP_KEY);
            string rootName = appProperty[PropertyConst.APP_KEY_LOG_ROOTPATH];
            string fileName = appProperty[PropertyConst.APP_KEY_LOG_FILENAME];
            AMWUtil.Logger.AMWLoggerManager.InitInstant(rootName, fileName);
            ADO.StaticValue.StaticValueManager.GetInstant().LoadAll();
            var context = new Utility.CustomAssemblyLoadContext();
            context.LoadUnmanagedLibrary(Path.Combine(Directory.GetCurrentDirectory(), "Library\\libwkhtmltox.dll"));

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
            services.AddMvc().AddNewtonsoftJson(options => options.SerializerSettings.ContractResolver = new DefaultContractResolver());
            services.AddSignalR();
            services.AddSingleton(typeof(IConverter), new SynchronizedConverter(new PdfTools()));
            services.AddControllers();
            this.SetUpScheduler();
            this.SetUpWorker(services);
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseHsts();
            }

            app.UseRouting();
            app.UseCors("AllowCors");
            app.UseHttpsRedirection();
            app.UseStaticFiles();

            this.SetUpHub(app);

            app.UseEndpoints(endpoint =>
            {
                endpoint.MapControllers();
            });

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
            var hubs = ADO.StaticValue.StaticValueManager.GetInstant().HubService;

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
            var jobs = ADO.StaticValue.StaticValueManager.GetInstant().ScheduleService;
            foreach (var jb in jobs)
            {
                BaseScheduleService.AddScheduleServiceSetup(jb);

                string jobCronex = jb.CronExpressions;
                string jobClassName = jb.FullClassName;
                var tJob = AMWUtil.Common.ClassType.GetClassType(jobClassName);
                IJobDetail w = SchedulerUtil.Start(tJob, jobCronex, new KeyValuePair<string, object>("ScheduleServiceID", jb.ID.Value));
            }
        }
        /*******************************/
        private void SetUpWorker_TMP(Dictionary<string, string> appProperty, IServiceCollection services)
        {
            string workerNames = appProperty.ContainsKey(PropertyConst.APP_KEY_WORKER_NAMES) ? appProperty[PropertyConst.APP_KEY_WORKER_NAMES] : string.Empty;
            if (!string.IsNullOrWhiteSpace(workerNames))
            {
                foreach (string n in workerNames.Split(','))
                {
                    string workerClassname = appProperty[string.Format(PropertyConst.APP_KEY_WORKER_CLASSNAME, n)];
                    var t = AMWUtil.Common.ClassType.GetClassType(workerClassname);
                    MethodInfo m1 = typeof(ServiceCollectionHostedServiceExtensions).GetMethod("AddHostedService", new Type[] { typeof(IServiceCollection) });
                    var m2 = m1.MakeGenericMethod(t);
                    IServiceCollection w = (IServiceCollection)m2.Invoke(null, new object[] { services });
                }
            }
        }
        private void SetUpScheduler_TMP(Dictionary<string,string> appProperty)
        {
            string jobNames = appProperty.ContainsKey(PropertyConst.APP_KEY_JOB_NAMES) ? appProperty[PropertyConst.APP_KEY_JOB_NAMES] : string.Empty;
            if (!string.IsNullOrWhiteSpace(jobNames))
            {
                foreach (string n in jobNames.Split(','))
                {
                    string jobCronex = appProperty[string.Format(PropertyConst.APP_KEY_JOB_CRONEX, n)];
                    string jobClassname = appProperty[string.Format(PropertyConst.APP_KEY_JOB_CLASSNAME, n)];
                    string jobData = appProperty[string.Format(PropertyConst.APP_KEY_JOB_DATA, n)];
                    var tJob = AMWUtil.Common.ClassType.GetClassType(jobClassname);
                    var v = jobData.Json<Dictionary<string, object>>();

                    IJobDetail w = AMWUtil.Common.SchedulerUtil.Start(tJob, jobCronex, v.FieldKeyValuePairs().ToArray());
                    
                }
            }
        }
        private void SetUpHub_TMP(Dictionary<string, string> appProperty, IApplicationBuilder app)
        {
            string hubNames = appProperty.ContainsKey(PropertyConst.APP_KEY_HUB_NAMES) ? appProperty[PropertyConst.APP_KEY_HUB_NAMES] : string.Empty;
            if (!string.IsNullOrWhiteSpace(hubNames))
            {
                app.UseEndpoints(routes =>
                {
                    foreach (string n in hubNames.Split(','))
                    {
                        string hubURL = appProperty[string.Format(PropertyConst.APP_KEY_HUB_URL, n)];
                        string hubClassname = appProperty[string.Format(PropertyConst.APP_KEY_HUB_CLASSNAME, n)];
                        var t = AMWUtil.Common.ClassType.GetClassType(hubClassname);

                        var m1 = typeof(HubEndpointRouteBuilderExtensions).GetMethod("MapHub", new Type[] { typeof(IEndpointRouteBuilder), typeof(string) });
                        var m2 = m1.MakeGenericMethod(t);
                        m2.Invoke(routes, new object[] { routes, new string(hubURL) });
                    }
                });
            }
        }
    }
}
