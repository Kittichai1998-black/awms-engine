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
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ProjectSTA.Engine.JobService;

namespace ProjectSTA
{
    public class Startup : AWMSEngine.Startup
    {
        public Startup(IConfiguration configuration) : base(configuration)
        {
        }
    }

}
