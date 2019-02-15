using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using AWMSEngine.JobService;
using Microsoft.AspNetCore.Mvc;
using AWMSEngine.APIService.API2;
using AWMSEngine.APIService.WM;
using AMWUtil.Common;

namespace AWMSEngine.Controllers
{
    [Route("api/values")]
    [ApiController]
    public class ValuesController : ControllerBase
    {

        // GET api/values
        [HttpGet]
        public dynamic Get()
        {
            System.Reflection.Assembly assembly = System.Reflection.Assembly.GetExecutingAssembly();
            FileVersionInfo fvi = FileVersionInfo.GetVersionInfo(assembly.Location);
            string version = fvi.FileVersion;
            var linkTime = GetLinkerTime(assembly, TimeZoneInfo.Utc);


            return new { api = "1.1", build_version = version, build_date = linkTime.ToString("yyyy-MM-ddThh:mm") };
        }
        [HttpGet("saptest")]
        public string GetSAPTest()
        {
            var res = new APIService.TestConnectionSAPAPI(this, false).Execute(new { });
            List<string> datas = res.datas;
            return string.Join('\n', datas.ToArray());
        }
        [HttpGet("time")]
        public dynamic GetTime()
        {
            var val = ADO.DataADO.GetInstant().QueryString<dynamic>("select getdate() dt",null).FirstOrDefault();
            DateTime dt = val.dt;
            return new { serverTime = DateTime.Now, dbTime = dt };
        }
        [HttpGet("jobs")]
        public dynamic GetJobs()
        {
            return AMWUtil.Common.SchedulerUtil.MonitorJobs;
        }
        [HttpGet("test01")]
        public dynamic GetJobs(int skuID, int oldUnitID, int newUnitID, decimal qty)
        {
            var res = ADO.StaticValue.StaticValueManager.GetInstant().ConvertToNewUnitBySKU(skuID, qty, oldUnitID, newUnitID);
            return res;
        }




        private DateTime GetLinkerTime(Assembly assembly, TimeZoneInfo target = null)
        {
            var filePath = assembly.Location;
            const int c_PeHeaderOffset = 60;
            const int c_LinkerTimestampOffset = 8;

            var buffer = new byte[2048];

            using (var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read))
                stream.Read(buffer, 0, 2048);

            var offset = BitConverter.ToInt32(buffer, c_PeHeaderOffset);
            var secondsSince1970 = BitConverter.ToInt32(buffer, offset + c_LinkerTimestampOffset);
            var epoch = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);

            var linkTimeUtc = epoch.AddSeconds(secondsSince1970);

            var tz = target ?? TimeZoneInfo.Local;
            var localTime = TimeZoneInfo.ConvertTimeFromUtc(linkTimeUtc, tz);

            return localTime;
        }

        [HttpGet("checkAPI")]
        public dynamic CheckAPI()
        {
            CheckAPI exec = new CheckAPI(this);
            var req = ObjectUtil.QueryStringToObject(this.Request.QueryString.Value);
            var res = exec.Execute(req);
            return res;
        }
    }
}
