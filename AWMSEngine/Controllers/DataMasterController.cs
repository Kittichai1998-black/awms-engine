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
            SKUMasterPutFromFileServerAPI api = new SKUMasterPutFromFileServerAPI(this);
            return api.Execute(request);
        }
        [HttpPost("TransferFileServer/CustomerMst")]
        public dynamic TransferSF_CustomerMst([FromBody]dynamic request)
        {
            CustomerPutFromFileServerAPI api = new CustomerPutFromFileServerAPI(this);
            return api.Execute(request);
        }
        [HttpPost("TransferFileServer/SupplierMst")]
        public dynamic TransferFileServer_SupplierMst([FromBody]dynamic request)
        {
            SupplierPutFromFileServerAPI api = new SupplierPutFromFileServerAPI(this);
            return api.Execute(request);
        }
        [HttpPost("TransferFileServer/SKUMst/Csv")]
        public dynamic TransferSF_SKUMst_Csv([FromBody]dynamic request)
        {
            SKUMasterPutFromFileServerCsvAPI api = new SKUMasterPutFromFileServerCsvAPI(this);
            return api.Execute(request);
        }
        [HttpPost("TransferFileServer/CustomerMst/Csv")]
        public dynamic TransferSF_CustomerMst_Csv([FromBody]dynamic request)
        {
            CustomerPutFromFileServerCsvAPI api = new CustomerPutFromFileServerCsvAPI(this);
            return api.Execute(request);
        }
        [HttpPost("TransferFileServer/SupplierMst/Csv")]
        public dynamic TransferFileServer_SupplierMst_Csv([FromBody]dynamic request)
        {
            SupplierPutFromFileServerCsvAPI api = new SupplierPutFromFileServerCsvAPI(this);
            return api.Execute(request);
        }


    }
}