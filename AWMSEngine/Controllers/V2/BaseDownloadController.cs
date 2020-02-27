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
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net;

namespace AWMSEngine.Controllers.V2
{
    [Route("download")]
    [ApiController]
    public class BaseDownloadController : ControllerBase
    {
        private readonly IWebHostEnvironment _hostingEnvironment;
        public BaseDownloadController(IWebHostEnvironment hostingEnvironment)
        {
            _hostingEnvironment = hostingEnvironment;
        }

        [HttpGet("get_log")]
        public async Task<IActionResult> LogDownload(string path)
        {
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
        public async Task<IActionResult> FindLogDownload(string path,string search)
        {
            try
            {
                if (string.IsNullOrEmpty(path))
                    throw new Exception("path can't empty");
                if (!path.EndsWith(".log"))
                    throw new Exception("can dowload *.log only");

                var stream = AMWUtil.Common.FileUtil.findstr(path, search);
                string fileName = search + "." + DateTime.Now.ToString("yyyyMMdd_hhmmss") + ".log";
                return File(stream.BaseStream, "application/octet-stream", fileName);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
}