using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace WCSSimAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WCSOutboundsController : ControllerBase
    {
        public class TReq
        {
            public List<queueout> queueOut;
            public class queueout
            {
                public long? queueID;
                public string desWarehouseCode;
                public string desAreaCode;
                public string desLocationCode;
                public int priority;
                public baseinfo baseInfo;
                public class baseinfo
                {
                    public string baseCode;
                    public List<packinfo> packInfos;
                    public class packinfo
                    {
                        public string skuCode;
                        public decimal skuQty;
                        public string lot;
                        public string batch;
                    }
                }
            }
        }


        [HttpPost]
        public dynamic RegisterOutbounds([FromBody] dynamic data)
        {
            var res = ADO.DataADO.GetInstant().set_wcs_register_queue(null, data.queueOut.Json());
            return res;
        }
    }
}