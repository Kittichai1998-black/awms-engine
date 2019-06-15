using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.PropertyFile;
using AWMSEngine.JobService;
using AWMSModel.Constant.StringConst;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using ProjectSTA.Engine.JobService;

namespace ProjectSTA
{
    public class Startup 
    {
        // This method gets called by the runtime. Use this method to add services to the container.
        // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
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
            AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant();


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
