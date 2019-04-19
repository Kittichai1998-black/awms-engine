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
        [HttpGet("{serviceCode}")]
        public dynamic GetAPIService(string serviceCode)
        {
            var jsond = ObjectUtil.QueryStringToObject(this.Request.QueryString.Value);
            var res = getClass(serviceCode, jsond);
            return res;
        }

        [HttpPost("{serviceCode}")]
        public dynamic PostAPIService([FromBody]dynamic request, string serviceCode)
        {
            var res = getClass(serviceCode, request);
            return res;
        }

        [HttpPut("{serviceCode}")]
        public dynamic PutAPIService([FromBody]dynamic request, string serviceCode)
        {
            var res = getClass(serviceCode, request);
            return res;
        }

        [HttpDelete("{serviceCode}")]
        public dynamic DeleteAPIService([FromBody]dynamic request, string serviceCode)
        {
            var res = getClass(serviceCode, request);
            return res;
        }

        private dynamic getClass(string serviceCode, dynamic jsonObj)
        {
            var getStatic = ADO.StaticValue.StaticValueManager.GetInstant().APIServices;
            var className = getStatic.FirstOrDefault(x => x.Code == serviceCode).FullClassName;
            Type type = Type.GetType(className);
            var getInstanct = (APIService.BaseAPIService)Activator.CreateInstance(type, new object[] { this });
            var res = getInstanct.Execute(jsonObj);
            return res;
        }
    }
}