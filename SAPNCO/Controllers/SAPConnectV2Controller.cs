using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace SAPNCO.Controllers
{
    public class SAPConnectV2Controller : ApiController
    {
        public dynamic Post([FromBody]Models.RequestCriteriaMulti value)
        {
            ADO.SAPExec exec = new ADO.SAPExec();
            var res = exec.execMulti(value);
            return res;
        }
    }
}
