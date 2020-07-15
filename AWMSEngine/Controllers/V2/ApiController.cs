using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.HubService;
using AWMSModel.Criteria;
using DinkToPdf.Contracts;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace AWMSEngine.Controllers.V2
{
    [Route("v2")]
    [ApiController]
    public class ApiController : BaseController
    {
        public ApiController(IHubContext<CommonMessageHub> commonMsgHub, IWebHostEnvironment hostingEnvironment, IConverter converter) : base(commonMsgHub, hostingEnvironment, converter)
        {
        }

        [HttpGet("time")]
        public dynamic GetTime()
        {
            var val = ADO.DataADO.GetInstant().QueryString<dynamic>("select getdate() dt", null).FirstOrDefault();
            DateTime dt = val.dt;
            return new { serverTime = DateTime.Now, dbTime = dt };
        }
        [HttpGet("download/{serviceCode}")]
        public async Task<IActionResult> DownloadAPIService(string serviceCode)
        {
            var jsond = ObjectUtil.QryStrToDynamic(this.Request.QueryString.Value);
            var res = ExecuteAPI(serviceCode, "get", true, jsond);

            if (res._result.status == 1 && res.stream is Stream)
            {
                Stream _stream = (Stream)res.stream;
                string _contentType = (string)res.contentType;
                string _fileName = (string)res.fileName;
                return File(_stream, _contentType, _fileName);
            }
            else if (res._result.status == 1 && res.stream is byte[])
            {
                byte[] _stream = (byte[])res.stream;
                string _contentType = (string)res.contentType;
                string _fileName = (string)res.fileName;
                return File(_stream, _contentType, _fileName);
            }
            else if (res._result.status == 1 && res.stream is FileStream)
            {
                FileStream _stream = (FileStream)res.stream;
                string _contentType = (string)res.contentType;
                string _fileName = (string)res.fileName;
                return File(_stream, _contentType, _fileName);
            }
            else
            {
                string _message = (string)res._message;
                return this.NotFound(_message);
            }
        }

        [HttpPost("download/{serviceCode}")]
        public async Task<IActionResult> PostDownloadAPIService([FromBody]dynamic request, string serviceCode)
        {
            var res = ExecuteAPI(serviceCode, "post", true, request);
            if (res._result.status == 1 && res.stream is Stream)
            {
                Stream _stream = (Stream)res.stream;
                string _contentType = (string)res.contentType;
                string _fileName = (string)res.fileName;
                return File(_stream, _contentType, _fileName);
            }
            else if (res._result.status == 1 && res.stream is byte[])
            {
                byte[] _stream = (byte[])res.stream;
                string _contentType = (string)res.contentType;
                string _fileName = (string)res.fileName;
                return File(_stream, _contentType, _fileName);
            }
            else if(res._result.status == 1 && res.stream is FileStream)
            {
                FileStream _stream = (FileStream)res.stream;
                string _contentType = (string)res.contentType;
                string _fileName = (string)res.fileName;
                return File(_stream, _contentType, _fileName);
            }
            else
            {
                string _message = (string)res._message;
                return this.NotFound(_message);
            }
        }

        [HttpGet("{serviceCode}")]
        public dynamic GetAPIService(string serviceCode)
        {
            var jsond = ObjectUtil.QryStrToDynamic(this.Request.QueryString.Value);
            var res = ExecuteAPI(serviceCode, "get", true, jsond);
            return res;
        }

        [HttpPost("{serviceCode}")]
        public dynamic PostAPIService([FromBody]dynamic request, string serviceCode)
        {
            var res = ExecuteAPI(serviceCode, "post", true, request);
            return res;
        }

        [HttpPut("{serviceCode}")]
        public dynamic PutAPIService([FromBody]dynamic request, string serviceCode)
        {
            var res = ExecuteAPI(serviceCode, "put", true, request);
            return res;
        }

        [HttpDelete("{serviceCode}")]
        public dynamic DeleteAPIService([FromBody]dynamic request, string serviceCode)
        {
            var res = ExecuteAPI(serviceCode, "delete", true, request);
            return res;
        }

        //protected abstract Type GetClass(string fullName);

        private dynamic ExecuteAPI(string serviceCode, string method, bool isAuthen, dynamic jsonObj)
        {
           try
            {
                var getStatic = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant().APIServices;
                var serviceMst = getStatic.FirstOrDefault(x => x.Code.ToUpper().Trim() == serviceCode.ToUpper() && x.ActionCommand.ToUpper() == method.ToUpper());

                if (serviceMst != null)
                {
                    Type type = ClassType.GetClassType(serviceMst.FullClassName.Trim());//Type.GetType(className.FullClassName);
                    var getInstanct = (AWMSEngine.APIService.BaseAPIService)Activator.CreateInstance(type, new object[] { (ControllerBase)this, (int)serviceMst.ID.Value, isAuthen });
                    var res = getInstanct.Execute(jsonObj);
                    return res;
                }
                else
                    return new
                    {
                        _result = new
                        {
                            status = 0,
                            code = AMWUtil.Exception.AMWExceptionCode.S0001.ToString(),
                            message = "service config is not found"
                        }
                    };
            }
            catch(Exception ex)
            { 
                return new
                {
                    _result = new
                    {
                        status = 0,
                        code = AMWUtil.Exception.AMWExceptionCode.U0000.ToString(),
                        message = ex.Message
                    }
                };
            }
        }
    }
}