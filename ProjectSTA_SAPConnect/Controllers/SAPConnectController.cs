using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace ProjectSTA_SAPConnect.Controllers
{
    public class SAPConnectController : ApiController
    {
        public dynamic Post([FromBody]Models.RequestCriteria value)
        {
            ADO.SAPExec exec = new ADO.SAPExec();
            var res = exec.exec(value);
            return res;
        }
    }
}
