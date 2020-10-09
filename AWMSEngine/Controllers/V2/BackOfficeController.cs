using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using AWMSModel.Constant.StringConst;
using AMWUtil.PropertyFile;
using Microsoft.AspNetCore.SignalR;
using AWMSEngine.HubService;
using DinkToPdf.Contracts;

namespace AWMSEngine.Controllers.V2
{
    [Route("v2/backoffice")]
    [ApiController]
    public class BackOfficeController : BaseController
    {
        public BackOfficeController(IHubContext<CommonMessageHub> commonMsgHub, IWebHostEnvironment hostingEnvironment, IConverter converter) : base(commonMsgHub, hostingEnvironment, converter)
        {
        }

        [HttpGet("info")]
        public dynamic info()
        {
            Version version = System.Reflection.Assembly.GetExecutingAssembly().GetName().Version;
            string rootDir = HostingEnvironment.WebRootPath ?? HostingEnvironment.ContentRootPath;
            var dllNames = Directory.GetFiles(rootDir);
            List<dynamic> dllInfos = new List<dynamic>();
            foreach (var dllName in dllNames)
            {
                if (!dllName.EndsWith(".property") && !dllName.EndsWith(".dll"))
                    continue;

                var infoName = dllName.Substring(dllName.LastIndexOf('\\') + 1);
                var infoTime = System.IO.File.GetLastWriteTime(dllName);
                dllInfos.Add(new { file = infoName, modify = infoTime });
            }

            string dbServer = ADO.DataADO.GetInstant().ConnectionString
                .Split(';')
                .First(x => x.ToUpper().StartsWith("SERVER"))
                .Split('=')[1];
            string dbStatus = string.Empty;
            try
            {
                var conn = ADO.DataADO.GetInstant().CreateConnection();
                conn.Open();
                conn.Close();
                conn.Dispose();
                dbStatus = "OPEN";
            }
            catch (Exception ex)
            {
                dbStatus = ex.Message;
            }
            var database = new { server = dbServer, status = dbStatus };

            //var workers = Startup.WorkerControllers;
            //var scheduler = Startup.SchedulerControllers;

            return new
            {
                version = version.ToString(),
                database = database,
                rootDir = rootDir,
                dllInfos = dllInfos,
            };
        }
    }
}