using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.Controllers
{
    [Route("v2")]
    [ApiController]
    public class APIv2Controller : ControllerBase
    {
        [HttpGet("{serviceCode}/{method}")]
        public dynamic GetAPIService(string serviceCode, string method)
        {
            var jsond = ObjectUtil.QueryStringToObject(this.Request.QueryString.Value);
            var res = getClass(serviceCode, method, jsond);
            return res;
        }

        [HttpPost("{serviceCode}/{method}")]
        public dynamic PostAPIService([FromBody]dynamic request, string serviceCode, string method)
        {
            var res = getClass(serviceCode, method, request);
            return res;
        }

        [HttpPut("{serviceCode}/{method}")]
        public dynamic PutAPIService([FromBody]dynamic request, string serviceCode, string method)
        {
            var res = getClass(serviceCode, method, request);
            return res;
        }

        [HttpDelete("{serviceCode}/{method}")]
        public dynamic DeleteAPIService([FromBody]dynamic request, string serviceCode, string method)
        {
            var res = getClass(serviceCode, method, request);
            return res;
        }

        private dynamic getClass(string serviceCode, string method, dynamic jsonObj)
        {
            var getStatic = ADO.StaticValue.StaticValueManager.GetInstant().APIServices;
            var className = getStatic.FirstOrDefault(x => x.Code.ToUpper() == serviceCode.ToUpper() && x.ActionCommand.ToUpper() == method.ToUpper());
            if (className != null)
            {
                Type type = Type.GetType(className.FullClassName);
                var getInstanct = (APIService.BaseAPIService)Activator.CreateInstance(type, new object[] { this });
                var res = getInstanct.Execute(jsonObj);
                return res;
            }
            else
                return "class name is not defined.";
        }
    }
}