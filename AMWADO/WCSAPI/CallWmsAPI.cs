using ADO.WCSStaticValue;
using AMSModel.Criteria;
using AMWUtil.DataAccess.Http;
using System;
using System.Collections.Generic;
using System.Text;

namespace ADO.WCSAPI
{
    public class CallWmsAPI : BaseAPI<CallWmsAPI>
    {
        public WorkQueueCriteria RegisterWQ(WMReq_RegisterWQ req)
        {
            var res = RESTFulAccess.SendJson<dynamic>(null,
                StaticValueManager.GetInstant().GetConfigValue("regist_wq"), 
                RESTFulAccess.HttpMethod.POST, req, null, 1, 60000);

            if (res._result.status != 1)
                throw new Exception("WMS Error : " + res._result.message);

            return AMWUtil.Common.ObjectUtil.DynamicToModel<WorkQueueCriteria>(res);
        }
        public WorkQueueCriteria WorkingWQ(WMReq_WorkingWQ req)
        {
            var res = RESTFulAccess.SendJson<dynamic>(null,
                StaticValueManager.GetInstant().GetConfigValue("work_wq"),
                RESTFulAccess.HttpMethod.POST, req, null, 1, 60000);

            if (res._result.status != 1)
                throw new Exception("WMS Error : " + res._result.message);

            return AMWUtil.Common.ObjectUtil.DynamicToModel<WorkQueueCriteria>(res);
        }
        public WorkQueueCriteria DoneWQ(WMReq_DoneWQ req)
        {
            var res = RESTFulAccess.SendJson<dynamic>(null,
                StaticValueManager.GetInstant().GetConfigValue("done_wq"),
                RESTFulAccess.HttpMethod.POST, req, null, 1, 60000);

            if (res._result.status != 1)
                throw new Exception("WMS Error : "+res._result.message);

            return AMWUtil.Common.ObjectUtil.DynamicToModel<WorkQueueCriteria>(res);
        }
        public dynamic MoveLocation(dynamic req)
        {
            //var res = RESTFulAccess.SendJson<dynamic>(null,
            //    StaticValueManager.GetInstant().GetConfigValue("move_location"),
            //    RESTFulAccess.HttpMethod.POST, req, null, 1, 60000);

            return null;
        }
    }
}
