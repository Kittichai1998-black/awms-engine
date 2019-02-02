using AMWUtil.Common;
using AMWUtil.DataAccess.Http;
using Quartz;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WCSSimAPI.Jobs
{
    public class WMS_WorkingJobs : IJob
    {
        public Task Execute(IJobExecutionContext context)
        {
            var req = ADO.DataADO.GetInstant().list_request_wms_working(null);
            if (!string.IsNullOrWhiteSpace(req.basecode))
            {
                var res = AMWUtil.DataAccess.Http.RESTFulAccess.SendJson<dynamic>(null, ConstConfig.WMSApiURL + "/api/wm/asrs/queue/working", RESTFulAccess.HttpMethod.POST, req.sJson.Json<dynamic>());
                //ADO.DataADO.GetInstant().set_response_wms_working(null, req.basecode, ObjectUtil.Json(res));
            }
            return null;
        }
    }
}
