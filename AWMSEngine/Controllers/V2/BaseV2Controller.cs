using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using AMWUtil.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.Controllers.V2
{
    [Route("v2")]
    [ApiController]
    public class BaseV2Controller : ControllerBase
    {
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
            var getStatic = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant().APIServices;
            var className = getStatic.FirstOrDefault(x => x.Code.ToUpper() == serviceCode.ToUpper() && x.ActionCommand.ToUpper() == method.ToUpper());
            
            if (className != null)
            {
                Type type = ClassType.GetClassType(className.FullClassName);//Type.GetType(className.FullClassName);
                var getInstanct = (AWMSEngine.APIService.BaseAPIService)Activator.CreateInstance(type, new object[] { this, isAuthen });
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
                        message = "service is not found"
                    }
                };
        }
    }
}