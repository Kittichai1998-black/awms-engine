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
    public class WMS_LocationInfoJobs
    {
        public string Execute()
        {
            try
            {
                var req = ADO.DataADO.GetInstant().list_request_wms_location_info(null);
                if (!string.IsNullOrWhiteSpace(req.basecode))
                {
                    var res = AMWUtil.DataAccess.Http.RESTFulAccess.SendJson<dynamic>(null, ConstConfig.WMSApiURL + "/api/wm/asrs/location", RESTFulAccess.HttpMethod.POST, req.sJson.Json<dynamic>(), null, 1, 60000);
                    ADO.DataADO.GetInstant().set_response_wms_location_info(null, req.basecode, ObjectUtil.Json(res));
                    StatusController.errorListsLocInfo.Insert(0, DateTime.Now.ToString("dd/MM/yyyy hh:mm:ss") + " :: " + req.basecode);
                }
                //StatusController.errorListsLocInfo.Add(DateTime.Now.ToString("dd/MM/yyyy hh:mm:ss") + " :: " + "OK");
                return DateTime.Now.ToString("dd/MM/yyyy hh:mm:ss") + " => OK";
            }
            catch (Exception ex)
            {
                StatusController.errorListsLocInfo.Insert(0, DateTime.Now.ToString("dd/MM/yyyy hh:mm:ss") + " :: " + ex.Message);
                return DateTime.Now.ToString("dd/MM/yyyy hh:mm:ss") + " => " + ex.StackTrace;
            }
            finally
            {
                if (StatusController.errorListsLocInfo.Count > 20)
                    StatusController.errorListsLocInfo.RemoveAt(StatusController.errorListsLocInfo.Count - 1);
            }
        }
    }
}
