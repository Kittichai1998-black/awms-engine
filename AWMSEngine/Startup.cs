using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.PropertyFile;
using AWMSEngine.JobService;
using AWMSModel.Constant.StringConst;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

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
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {

            PropertyFileManager.GetInstant().AddPropertyFile(PropertyConst.APP_KEY, env.ContentRootPath + PropertyConst.APP_FILENAME);
            var appProperty = PropertyFileManager.GetInstant().GetPropertyDictionary(PropertyConst.APP_KEY);

            string rootName = appProperty[PropertyConst.APP_KEY_LOG_ROOTPATH];
            string fileName = appProperty[PropertyConst.APP_KEY_LOG_FILENAME];
            AMWUtil.Logger.AMWLoggerManager.InitInstant(rootName, fileName);
            ADO.StaticValue.StaticValueManager.GetInstant();

            AMWUtil.Common.SchedulerUtil.Start<PostGRDoc311ToSAPJob>("0 0/5 * * * ?");
            AMWUtil.Common.SchedulerUtil.Start<PostGRDocPackage321ToSAPJob>("0 0/5 * * * ?");

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
            app.UseMvc();
        }
    }
}
