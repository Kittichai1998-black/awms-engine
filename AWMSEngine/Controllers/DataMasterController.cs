using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.Engine.APIService.Mst;
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
            var api = new AWMSEngine.Engine.APIService.Data.InsUpdDataAPI();
            var res = api.Execute(request);
             
            return res;
        }

        [HttpGet]
        public dynamic GetData()
        {
            var jsond = ObjectUtil.QueryStringToObject(this.Request.QueryString.Value);
            var api = new AWMSEngine.Engine.APIService.Data.SelectDataMstAPI();
            var res = api.Execute(jsond);
            return res;
        }

        [HttpPost("TransferFileServer/SKUMst")]
        public dynamic TransferSF_SKUMst([FromBody]dynamic request)
        {
            SKUMasterPutFromFileServerAPI api = new SKUMasterPutFromFileServerAPI();
            return api.Execute(request);
        }
        [HttpPost("TransferFileServer/CustomerMst")]
        public dynamic TransferSF_CustomerMst([FromBody]dynamic request)
        {
            CustomerPutFromFileServerAPI api = new CustomerPutFromFileServerAPI();
            return api.Execute(request);
        }
        [HttpPost("TransferFileServer/SupplierMst")]
        public dynamic TransferFileServer_SupplierMst([FromBody]dynamic request)
        {
            SupplierPutFromFileServerAPI api = new SupplierPutFromFileServerAPI();
            return api.Execute(request);
        }
        [HttpPost("TransferFileServer/SKUMst/Csv")]
        public dynamic TransferSF_SKUMst_Csv([FromBody]dynamic request)
        {
            SKUMasterPutFromFileServerCsvAPI api = new SKUMasterPutFromFileServerCsvAPI();
            return api.Execute(request);
        }
        [HttpPost("TransferFileServer/CustomerMst/Csv")]
        public dynamic TransferSF_CustomerMst_Csv([FromBody]dynamic request)
        {
            CustomerPutFromFileServerCsvAPI api = new CustomerPutFromFileServerCsvAPI();
            return api.Execute(request);
        }
        [HttpPost("TransferFileServer/SupplierMst/Csv")]
        public dynamic TransferFileServer_SupplierMst_Csv([FromBody]dynamic request)
        {
            SupplierPutFromFileServerCsvAPI api = new SupplierPutFromFileServerCsvAPI();
            return api.Execute(request);
        }


    }
}