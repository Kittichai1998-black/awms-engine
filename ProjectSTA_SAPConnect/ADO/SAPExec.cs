using ProjectSTA_SAPConnect.Models;
using SAP.Middleware.Connector;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ProjectSTA_SAPConnect.ADO
{
    public class SAPExec
    {
        public ResponseCriteria exec(RequestCriteria req)
        {
            try
            {

                RfcDestinationManager.RegisterDestinationConfiguration(new CLS_CSAP());
                RfcDestination SapRfcDistination = RfcDestinationManager.GetDestination(req.environmentName);
                RfcRepository SapRfcRepository = SapRfcDistination.Repository;
                IRfcFunction COMPANY_GETDETAIL = SapRfcRepository.CreateFunction(req.functionName);// "BAPI_COMPANYCODE_GETDETAIL");

                foreach (var data in req.datas)
                {
                    COMPANY_GETDETAIL.SetValue(data.Key, data.Value); //"COMPANYCODEID", "TEST");
                }
                COMPANY_GETDETAIL.Invoke(SapRfcDistination);
                var res = COMPANY_GETDETAIL.GetStructure(0);
                //string dd = COMPANY_GETDETAIL.GetStructure(0).ToString();
                return new ResponseCriteria()
                {
                    datas = res,
                    status = 1,
                    message = "SUCCESS",
                    stacktrace = string.Empty
                };
            }
            catch (Exception ex)
            {
                return new ResponseCriteria()
                {
                    datas = null,
                    status = 0,
                    message = ex.Message,
                    stacktrace = ex.StackTrace
                };
            }

        }
    }
}