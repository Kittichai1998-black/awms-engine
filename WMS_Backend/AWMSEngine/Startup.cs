using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using AMWUtil.Common;
using AMWUtil.PropertyFile;
using AWMSEngine.HubService;
using AWMSEngine.JobService;
using AWMSEngine.WorkerService;
using AWMSModel.Constant.StringConst;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Quartz;

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
            this.SetUpWorker(appProperty, services);

            services.AddCors(options =>
            {
                options.AddPolicy("AllowCors", builder =>
                {
                    builder
                    .AllowAnyOrigin()
                    //.WithMethods("GET", "PUT", "POST", "DELETE")
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials()
                    .WithExposedHeaders("x-custom-header");
                });
            });
            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_1);

            services.AddSignalR();



        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            var appProperty = PropertyFileManager.GetInstant().GetPropertyDictionary(PropertyConst.APP_KEY);

            string rootName = appProperty[PropertyConst.APP_KEY_LOG_ROOTPATH];
            string fileName = appProperty[PropertyConst.APP_KEY_LOG_FILENAME];
            AMWUtil.Logger.AMWLoggerManager.InitInstant(rootName, fileName);
            ADO.StaticValue.StaticValueManager.GetInstant();

            this.SetUpScheduler(appProperty);
            this.SetUpHub(appProperty,app);


            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseHsts();
            }

            app.UseCors("AllowCors");
            app.UseHttpsRedirection();
            app.UseStaticFiles();

            app.UseMvc();


        }

        public static IServiceCollection WorkerControllers = null;// new List<ServiceDescriptor>();
        public static List<IJobDetail> SchedulerControllers = new List<IJobDetail>();

        private void SetUpWorker(Dictionary<string, string> appProperty, IServiceCollection services)
        {
            string workerNames = appProperty.ContainsKey(PropertyConst.APP_KEY_WORKER_NAMES) ? appProperty[PropertyConst.APP_KEY_WORKER_NAMES] : string.Empty;
            if (!string.IsNullOrWhiteSpace(workerNames))
            {
                foreach (string n in workerNames.Split(','))
                {
                    string workerClassname = appProperty[string.Format(PropertyConst.APP_KEY_WORKER_CLASSNAME, n)];
                    var t = AMWUtil.Common.ClassType.GetClassType(workerClassname);
                    var m1 = typeof(ServiceCollectionHostedServiceExtensions).GetMethod("AddHostedService",
                        BindingFlags.NonPublic | BindingFlags.Public | BindingFlags.Static | BindingFlags.FlattenHierarchy);
                    var m2 = m1.MakeGenericMethod(t);
                    IServiceCollection w = (IServiceCollection)m2.Invoke(null, new object[] { services });
                    //var st = w.Where(x => x.ServiceType.GetType() == t).ToList();
                    //st.RemoveAll(x => WorkerControllers.Any(y => y == x));
                    WorkerControllers = w;
                    //IServiceCollection worker= ServiceCollectionHostedServiceExtensions.AddHostedService<CommonDashboardWorker>(services);
                    //ServiceCollectionHostedServiceExtensions.AddHostedService<DashboardWorker>(services);
                }
            }
        }
        private void SetUpScheduler(Dictionary<string,string> appProperty)
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
                    SchedulerControllers.Add(w);
                }
            }
        }
        private void SetUpHub(Dictionary<string, string> appProperty, IApplicationBuilder app)
        {
            string hubNames = appProperty.ContainsKey(PropertyConst.APP_KEY_HUB_NAMES) ? appProperty[PropertyConst.APP_KEY_HUB_NAMES] : string.Empty;
            if (!string.IsNullOrWhiteSpace(hubNames))
            {
                app.UseSignalR(routes =>
                {
                    foreach (string n in hubNames.Split(','))
                    {
                        string hubURL = appProperty[string.Format(PropertyConst.APP_KEY_HUB_URL, n)];
                        string hubClassname = appProperty[string.Format(PropertyConst.APP_KEY_HUB_CLASSNAME, n)];
                        var t = AMWUtil.Common.ClassType.GetClassType(hubClassname);
                        var t2 = routes.GetType();
                        var m1 = t2.GetMethod("MapHub", new Type[] { typeof(PathString) });
                        var m2 = m1.MakeGenericMethod(t);
                        m2.Invoke(routes, new object[] { new PathString(hubURL) });
                        //routes.MapHub<CommonMessageHub>("/clockhub");
                    }
                });
            }
        }
    }
}
