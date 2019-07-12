using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AMWUtil.PropertyFile;
using AWMSEngine.JobService;
using AWMSModel.Constant.StringConst;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using ProjectMRK.Engine.JobService;

namespace ProjectMRK
{
    public class Startup : AWMSEngine.Startup
    {
        public Startup(IConfiguration configuration) : base(configuration)
        {
            Dapper.DynamicParameters parameter = new Dapper.DynamicParameters();
            parameter.Add("IOType", "1");
            var res = AWMSEngine.ADO.DataADO.GetInstant().QuerySP("RP_DASHBOARD_WORKQUEUE", parameter, null);

            //var res = AMWUtil.DataAccess.Http.LineAccess.Notify(null, "oLEeNu9n4JRg2qyn9UkplEGwJ45cy4y5cJh028xmsjV", "Running Project MRK");
            //var res = ADO.LineNotify.notifyPicture("oLEeNu9n4JRg2qyn9UkplEGwJ45cy4y5cJh028xmsjV", "C:/Users/6200904/Desktop/signalr.txt");
        }




    }
}
