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
    public class WMS_RegisterJobs
    {
        public string Execute()
        {
            DateTime stDate = DateTime.Now;
            try
            {
                var req = ADO.DataADO.GetInstant().list_request_wms_register_queue(null);
                if (!string.IsNullOrWhiteSpace(req.basecode))
                {
                    DateTime stDate2 = DateTime.Now;
                    var res = AMWUtil.DataAccess.Http.RESTFulAccess.SendJson<dynamic>(null, ConstConfig.WMSApiURL + "/api/wm/asrs/queue/register", RESTFulAccess.HttpMethod.POST, req.sJson.Json<dynamic>(), null, 1, 60000);
                    DateTime stDate3 = DateTime.Now;
                    ADO.DataADO.GetInstant().set_response_wms_register_queue(null, req.basecode, ObjectUtil.Json(res));
                    StatusController.errorListsDone.Insert(0,
                        stDate.ToString("hh:mm:ss") + " > " +
                        stDate2.ToString("hh:mm:ss") + " > " +
                        stDate3.ToString("hh:mm:ss") + " > " +
                        DateTime.Now.ToString("hh:mm:ss") + " :: " + req.basecode);
                }
                //StatusController.errorListsRegister.Add(DateTime.Now.ToString("dd/MM/yyyy hh:mm:ss") + " :: " + "OK");
                return DateTime.Now.ToString("dd/MM/yyyy hh:mm:ss") + " => OK";
            }
            catch (Exception ex)
            {
                StatusController.errorListsRegister.Insert(0, DateTime.Now.ToString("dd/MM/yyyy hh:mm:ss") + " :: " + ex.Message);
                return DateTime.Now.ToString("dd/MM/yyyy hh:mm:ss") + " => " + ex.Message;
            }
            finally
            {
                if (StatusController.errorListsRegister.Count > 20)
                    StatusController.errorListsRegister.RemoveAt(StatusController.errorListsRegister.Count - 1);
            }
        }
    }
}
