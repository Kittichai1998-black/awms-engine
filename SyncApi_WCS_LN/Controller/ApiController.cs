using AMWUtil.Common;
using AMWUtil.Logger;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using SyncApi_WCS_LN.ADO;
using SyncApi_WCS_LN.Const;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace SyncApi_WCS_LN.Controller
{
    [Route("api")]
    [ApiController]
    public class ApiController : ControllerBase
    {
        [HttpGet("{api_name}")]
        public dynamic Get(string api_name)
        {
            var req = ObjectUtil.QryStrToDynamic(this.Request.QueryString.Value);
            return Exec(api_name, req);
        }
        [HttpPost("{api_name}")]
        public dynamic Post(string api_name,[FromBody]dynamic req)
        {
            return Exec(api_name, req);
        }

        private dynamic Exec(string api_name,dynamic datas)
        {
            AMWLogger logger = new AMWLogger(api_name, api_name);
            string api_name2 = ConfigADO.Post2wmsConfigs[ConfigString.KEY_APICONTROLLER_APINAMES].Split(",").FirstOrDefault(x => x.ToLower() == api_name.ToLower());
            if (string.IsNullOrEmpty(api_name2))
                return this.NotFound();
            string sp_exec = ConfigADO.Post2wmsConfigs[string.Format( ConfigString.KEY_APICONTROLLER_SP_EXEC,api_name2).ToLower()];
            var res = DataADO.GetInstant().Query<dynamic>(sp_exec, logger, datas);
            return res;

        }
    }
}
