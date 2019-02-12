using AMWUtil.Common;
using AMWUtil.DataAccess.Http;
using Quartz;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WCSSimAPI.Jobs
{
    public class WMS_RegisterJobs
    {
        public string Execute(AMWUtil.Logger.AMWLogger logger)
        {
            try
            {
                var req = ADO.DataADO.GetInstant().list_request_wms_register_queue(null);
                if (!string.IsNullOrWhiteSpace(req.basecode))
                {
                    if (logger != null) logger.LogInfo("WMS Request[" + req.basecode + "] : " + req.sJson);
                    var res = AMWUtil.DataAccess.Http.RESTFulAccess.SendJson<dynamic>(null, ConstConfig.WMSApiURL + "/api/wm/asrs/queue/register", RESTFulAccess.HttpMethod.POST, req.sJson.Json<dynamic>());
                    ADO.DataADO.GetInstant().set_response_wms_register_queue(null, req.basecode, ObjectUtil.Json(res));
                }
                return DateTime.Now.ToString("dd/MM/yyyy hh:mm:ss") + " => OK";
            }
            catch (Exception ex)
            {
                if (logger != null) logger.LogError(ex.Message);
                if (logger != null) logger.LogError(ex.StackTrace);
                return DateTime.Now.ToString("dd/MM/yyyy hh:mm:ss") + " => " + ex.Message;
            }
        }
    }
}
