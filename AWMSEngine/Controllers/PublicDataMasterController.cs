using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.APIService.Mst;
using AWMSEngine.APIService.Mst.Ers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.Controllers
{
    [Route("api/v2/mst/")]
    [ApiController]
    public class PublicDataMasterController : ControllerBase
    {

        [HttpPut("sku")]
        public dynamic PutSKUMaster([FromBody]dynamic datas)
        {
            var res = new PutSKUMasterAPI(this).Execute(datas);
            return res;
        }
        [HttpPut("sku2")]
        public dynamic PutSKUMaster_UnitType([FromBody]dynamic datas)
        {
            var res = new PutSKUMaster_UnitTypeAPI(this).Execute(datas);
            return res;
        }
        [HttpPut("warehouse")]
        public dynamic PutWarehouse([FromBody]dynamic datas)
        {
            var res = new PutWarehouseAPI(this).Execute(datas);
            return res;
        }
        [HttpPut("warehouse")]
        public dynamic PutSAPMovementType([FromBody]dynamic datas)
        {
            var res = new PutSAPMovementTypeAPI(this).Execute(datas);
            return res;
        }
    }

}