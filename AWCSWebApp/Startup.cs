using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft;
using AMWUtil.Logger;

namespace AWCSWebApp
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
            var logger = AMWLoggerManager.GetLogger("server", "event");
            logger.LogInfo("################ START SERVER ################");
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
            logger.LogInfo("services.AddCors");

            services.AddAuthorization();
            logger.LogInfo("services.AddAuthorization");

            services.AddControllers();
            logger.LogInfo("services.AddControllers");

            services.AddMvc().AddNewtonsoftJson();
            logger.LogInfo("services.AddMvc");
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            var logger = AMWLoggerManager.GetLogger("server", "event");
            app.UseHttpsRedirection();
            logger.LogInfo("app.UseHttpsRedirection");

            app.UseRouting();
            logger.LogInfo("app.UseRouting");

            app.UseAuthorization();
            logger.LogInfo("app.UseAuthorization");

            app.UseStaticFiles();
            logger.LogInfo("app.UseStaticFiles");

            app.UseCors("AllowCors");
            logger.LogInfo("app.UseCors");

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
            logger.LogInfo("app.UseEndpoints");
            logger.LogInfo("################ START SUCCESS ################");
        }
    }
}
