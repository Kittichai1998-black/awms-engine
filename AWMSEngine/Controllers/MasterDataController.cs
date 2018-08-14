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
            //{"token":"","apiKey":"","t":"",pk:"","datas":[{"test":"xx"}]}
            var api = new AWMSEngine.Engine.APIService.Data.InsUpdDataAPI();
            var res = api.Execute(request);

            return res;
        }

        [HttpGet]
        public dynamic GetData()
        {
            var jsond = ObjectUtil.QueryStringToObject(this.Request.QueryString.Value);
            //{"token":"","apiKey":"","t":"",pk:"","datas":[{"test":"xx"}]}
            var api = new AWMSEngine.Engine.APIService.Data.SelectDataAPI();
            var res = api.Execute(jsond);

            return res;
        }

        [HttpPost("TransferFileServer/SKUMst")]
        public dynamic TransferSF_SKUMst()
        {
            var jsond = ObjectUtil.QueryStringToObject(this.Request.QueryString.Value);
            SKUMasterPutFromFileServerAPI api = new SKUMasterPutFromFileServerAPI();

            return api.Execute(jsond);
        }
        [HttpPost("TransferFileServer/DealerMst")]
        public dynamic TransferSF_DealerMst()
        {
            var jsond = ObjectUtil.QueryStringToObject(this.Request.QueryString.Value);
            DealerPutFromFileServerAPI api = new DealerPutFromFileServerAPI();

            return api.Execute(jsond);
        }
        [HttpPost("TransferFileServer/SupplierMst")]
        public dynamic TransferFileServer_SupplierMst()
        {
            var jsond = ObjectUtil.QueryStringToObject(this.Request.QueryString.Value);
            SupplierPutFromFileServerAPI api = new SupplierPutFromFileServerAPI();

            return api.Execute(jsond);
        }
    }
}