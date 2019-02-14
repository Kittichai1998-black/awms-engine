using AMWUtil.Common;
using AMWUtil.DataAccess.Http;
using Quartz;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WCSSimAPI.Controllers;

namespace WCSSimAPI.Jobs
{
    public class WMS_DoneJobs
    {
        public string Execute()
        {
            try
            {
                var req = ADO.DataADO.GetInstant().list_request_wms_done(null);
                if (!string.IsNullOrWhiteSpace(req.basecode))
                {
                    var res = AMWUtil.DataAccess.Http.RESTFulAccess.SendJson<dynamic>(null, ConstConfig.WMSApiURL + "/api/wm/asrs/queue/done", RESTFulAccess.HttpMethod.POST, req.sJson.Json<dynamic>(), null, 1, 60000);
                    ADO.DataADO.GetInstant().set_response_wms_done(null, req.basecode, ObjectUtil.Json(res));
                    StatusController.errorListsDone.Insert(0, DateTime.Now.ToString("dd/MM/yyyy hh:mm:ss") + " :: " + req.basecode);
                }
                //StatusController.errorListsDone.Add(DateTime.Now.ToString("dd/MM/yyyy hh:mm:ss") + " :: " + "OK");
                return DateTime.Now.ToString("dd/MM/yyyy hh:mm:ss") + " => OK";
            }
            catch (Exception ex)
            {
                StatusController.errorListsDone.Insert(0, DateTime.Now.ToString("dd/MM/yyyy hh:mm:ss") + " :: " + ex.Message);
                return DateTime.Now.ToString("dd/MM/yyyy hh:mm:ss") + " => " + ex.Message;
            }
            finally
            {
                if (StatusController.errorListsDone.Count > 20)
                    StatusController.errorListsDone.RemoveAt(StatusController.errorListsDone.Count - 1);
            }
        }
    }
}
