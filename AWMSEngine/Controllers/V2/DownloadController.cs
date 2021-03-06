using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using AMSModel.Constant.StringConst;
using AMWUtil.PropertyFile;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net;
using Microsoft.AspNetCore.SignalR;
using AWMSEngine.HubService;
using DinkToPdf.Contracts;

namespace AWMSEngine.Controllers.V2
{
    [Route("download")]
    [ApiController]
    public class DownloadController : BaseController
    {
        public DownloadController(IHubContext<CommonMessageHub> commonMsgHub, IWebHostEnvironment hostingEnvironment, IConverter converter) : base(commonMsgHub, hostingEnvironment, converter)
        {
        }

        [HttpGet("get_log")]
        public async Task<IActionResult> LogDownload(string date,string logfile)
        {
            string path = PropertyFileManager.GetInstant().Get(PropertyConst.APP_KEY)[PropertyConst.APP_KEY_LOG_ROOTPATH];
            path = path
                .Replace("{MachineName}", Environment.MachineName)
                .Replace("{Date}", date)
                + logfile;
            try
            {
                if (string.IsNullOrEmpty(path))
                    throw new Exception("path can't empty");
                if (!path.EndsWith(".log"))
                    throw new Exception("can dowload *.log only");

                var stream = System.IO.File.OpenRead(path);
                string fileName = path.Split(new char[] { '\\', '/' }).Last();
                return File(stream, "application/octet-stream", fileName); // returns a FileStreamResult
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }
        [HttpGet("find_log")]
        public async Task<IActionResult> FindLogDownload(string date, string logfile, string search)
        {
            try
            {
                string path = PropertyFileManager.GetInstant().Get(PropertyConst.APP_KEY)[PropertyConst.APP_KEY_LOG_ROOTPATH];
                path = path
                    .Replace("{MachineName}", Environment.MachineName)
                    .Replace("{Date}", date)
                    + logfile;

                if (string.IsNullOrEmpty(path))
                    throw new Exception("path can't empty");
                if (!path.EndsWith(".log"))
                    throw new Exception("can dowload *.log only");

                var stream = AMWUtil.Common.FileUtil.findstr2(path, search);
                string fileName = search + "." + DateTime.Now.ToString("yyyyMMdd_hhmmss") + ".log";
                
                return File(stream, "application/octet-stream", fileName);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
}