using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.APIService.Data;
using AWMSEngine.APIService.Mst;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.Controllers
{
    [Route("api/mst")]
    [ApiController]
    public class DataMasterController : ControllerBase
    {
        [HttpPut]
        public dynamic PutData([FromBody]dynamic request)
        {
            var api = new InsUpdDataAPI(this);
            var res = api.Execute(request);
             
            return res;
        }

        [HttpGet]
        public dynamic GetData()
        {
            var jsond = ObjectUtil.QueryStringToObject(this.Request.QueryString.Value);
            var api = new SelectDataMstAPI(this);
            var res = api.Execute(jsond);
            return res;
        }

        [HttpPost("TransferFileServer/SKUMst")]
        public dynamic TransferSF_SKUMst([FromBody]dynamic request)
        {
            PutSKUMasterFromFileServerAPI api = new PutSKUMasterFromFileServerAPI(this);
            return api.Execute(request);
        }
        [HttpPost("TransferFileServer/CustomerMst")]
        public dynamic TransferSF_CustomerMst([FromBody]dynamic request)
        {
            PutCustomerFromFileServerAPI api = new PutCustomerFromFileServerAPI(this);
            return api.Execute(request);
        }
        [HttpPost("TransferFileServer/SupplierMst")]
        public dynamic TransferFileServer_SupplierMst([FromBody]dynamic request)
        {
            PutSupplierFromFileServerAPI api = new PutSupplierFromFileServerAPI(this);
            return api.Execute(request);
        }
        [HttpPost("TransferFileServer/SKUMst/Csv")]
        public dynamic TransferSF_SKUMst_Csv([FromBody]dynamic request)
        {
            PutSKUMasterFromFileServerCsvAPI api = new PutSKUMasterFromFileServerCsvAPI(this);
            return api.Execute(request);
        }
        [HttpPost("TransferFileServer/CustomerMst/Csv")]
        public dynamic TransferSF_CustomerMst_Csv([FromBody]dynamic request)
        {
            PutCustomerFromFileServerCsvAPI api = new PutCustomerFromFileServerCsvAPI(this);
            return api.Execute(request);
        }
        [HttpPost("TransferFileServer/SupplierMst/Csv")]
        public dynamic TransferFileServer_SupplierMst_Csv([FromBody]dynamic request)
        {
            PutSupplierFromFileServerCsvAPI api = new PutSupplierFromFileServerCsvAPI(this);
            return api.Execute(request);
        }


    }
}