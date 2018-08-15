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
    public class MasterDataController : ControllerBase
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
            var api = new AWMSEngine.Engine.APIService.Data.SelectDataAPI();
            var res = api.Execute(jsond);
            return res;
        }

        [HttpPost("TransferFileServer/SKUMst")]
        public dynamic TransferSF_SKUMst([FromBody]dynamic request)
        {
            SKUMasterPutFromFileServerAPI api = new SKUMasterPutFromFileServerAPI();
            return api.Execute(request);
        }
        [HttpPost("TransferFileServer/DealerMst")]
        public dynamic TransferSF_DealerMst([FromBody]dynamic request)
        {
            DealerPutFromFileServerAPI api = new DealerPutFromFileServerAPI();
            return api.Execute(request);
        }
        [HttpPost("TransferFileServer/SupplierMst")]
        public dynamic TransferFileServer_SupplierMst([FromBody]dynamic request)
        {
            SupplierPutFromFileServerAPI api = new SupplierPutFromFileServerAPI();
            return api.Execute(request);
        }

        
    }
}