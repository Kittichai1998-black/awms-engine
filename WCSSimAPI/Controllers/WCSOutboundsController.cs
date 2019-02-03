using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace WCSSimAPI.Controllers
{
    [Route("api/wcsOutbounds")]
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
        public dynamic RegisterOutbounds([FromBody] TReq data)
        {
            List<TReq> putQueueList = new List<TReq>();
            List<TReq> putQueueCheckList = new List<TReq>();
            List<TReq.queueout> putQueues = new List<TReq.queueout>();
            foreach (var q in data.queueOut)
            {
                putQueues.Add(q);
                if (putQueues.Count == 10)
                {
                    TReq r = new TReq() { queueOut = putQueues.Where(x => x.queueID.HasValue).ToList() };
                    putQueueList.Add(r);

                    var p = putQueues.Clone();
                    p.ForEach(x => x.queueID = null);
                    r = new TReq() { queueOut = p };
                    putQueueCheckList.Add(r);
                    putQueues = new List<TReq.queueout>();
                }
            }
            if(putQueues.Count > 0)
            {
                TReq r = new TReq() { queueOut = putQueues.Where(x => x.queueID.HasValue).ToList() };
                putQueueList.Add(r);

                var p = putQueues.Clone();
                p.ForEach(x => x.queueID = null);
                r = new TReq() { queueOut = p };
                putQueueCheckList.Add(r);
            }
           // bool isCheckOnly = !putQueueList.First().First().queueID.HasValue;

            dynamic resJson = null;
            foreach (var p in putQueueCheckList)
            {
                var resExec = ADO.DataADO.GetInstant().set_wcs_register_queue(null, Newtonsoft.Json.JsonConvert.SerializeObject(p));
                string resJsonStr = resExec._retjson;
                resJson = Newtonsoft.Json.JsonConvert.DeserializeObject(resJsonStr);
                if (resJson._result.resultcheck != 1)
                    return resJson;
            }

            foreach(var p in putQueueList)
            {
                if (p.queueOut.Count > 0)
                {
                    var resExec = ADO.DataADO.GetInstant().set_wcs_register_queue(null, Newtonsoft.Json.JsonConvert.SerializeObject(p));
                    string resJsonStr = resExec._retjson;
                    resJson = Newtonsoft.Json.JsonConvert.DeserializeObject(resJsonStr);
                }
            }

            return resJson;
        }
    }
}