using AMWUtil.Common;
using AMWUtil.DataAccess.Http;
using Quartz;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WCSSimAPI.ADO;
using WCSSimAPI.Controllers;

namespace WCSSimAPI.Jobs
{
    public class WMS_MoveLocationJobs
    {
        public string Execute()
        {
            DateTime stDate = DateTime.Now;
            try
            {
                var req = DataADO.GetInstant().list_request_wms_move_location(null);
                if (!string.IsNullOrWhiteSpace(req.basecode))
                {
                    DateTime stDate2 = DateTime.Now;
                    var res = AMWUtil.DataAccess.Http.RESTFulAccess.SendJson<dynamic>(null, ConstConfig.WMSApiURL + "/api/wm/asrs/sto/location", RESTFulAccess.HttpMethod.PUT, req.sJson.Json<dynamic>(), null, 1, 60000);
                    DateTime stDate3 = DateTime.Now;
                    DataADO.GetInstant().set_response_wms_move_location(null, req.basecode, ObjectUtil.Json(res));
                    StatusController.errorListsDone.Insert(0,
                        stDate.ToString("hh:mm:ss") + " > " +
                        stDate2.ToString("hh:mm:ss") + " > " +
                        stDate3.ToString("hh:mm:ss") + " > " +
                        DateTime.Now.ToString("hh:mm:ss") + " :: " + req.basecode);
                }
                //StatusController.errorListsLocInfo.Add(DateTime.Now.ToString("dd/MM/yyyy hh:mm:ss") + " :: " + "OK");
                return DateTime.Now.ToString("dd/MM/yyyy hh:mm:ss") + " => OK";
            }
            catch (Exception ex)
            {
                StatusController.errorListsLocMove.Insert(0, DateTime.Now.ToString("dd/MM/yyyy hh:mm:ss") + " :: " + ex.Message);
                return DateTime.Now.ToString("dd/MM/yyyy hh:mm:ss") + " => " + ex.StackTrace;
            }
            finally
            {
                if (StatusController.errorListsLocMove.Count > 20)
                    StatusController.errorListsLocMove.RemoveAt(StatusController.errorListsLocMove.Count - 1);
            }
        }
    }
}
