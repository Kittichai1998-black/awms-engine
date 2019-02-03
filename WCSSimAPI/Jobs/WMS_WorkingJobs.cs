using AMWUtil.Common;
using AMWUtil.DataAccess.Http;
using Quartz;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WCSSimAPI.Jobs
{
    public class WMS_WorkingJobs
    {
        public string Execute(AMWUtil.Logger.AMWLogger logger)
        {
            try
            {
                var req = ADO.DataADO.GetInstant().list_request_wms_working(null);
                if (!string.IsNullOrWhiteSpace(req.basecode))
                {
                    logger.LogInfo("WMS Request[" + req.basecode + "] : " + req.sJson);
                    var res = AMWUtil.DataAccess.Http.RESTFulAccess.SendJson<dynamic>(null, ConstConfig.WMSApiURL + "/api/wm/asrs/queue/working", RESTFulAccess.HttpMethod.POST, req.sJson.Json<dynamic>());
                    ADO.DataADO.GetInstant().set_response_wms_working(null, req.basecode, ObjectUtil.Json(res));
                }
                return DateTime.Now.ToString("dd/MM/yyyy hh:mm:ss") + " => OK";
            }
            catch (Exception ex)
            {
                logger.LogError(ex.Message);
                return DateTime.Now.ToString("dd/MM/yyyy hh:mm:ss") + " => " + ex.Message;
            }
        }
    }
}
