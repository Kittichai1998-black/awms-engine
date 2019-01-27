using AMWUtil.DataAccess.Http;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.ADO.QueueApi
{
    public class WCSQueueApi : BaseMSSQLAccess<WCSQueueApi>
    {
        public class TReq
        {
            public List<queueout> queueOut;
            public class queueout
            {
                public long queueID;
                public string desWarehouseCode;
                public string desAreaCode;
                public string desLocationCode;
                public int priority;
                public List<baseinfo> baseInfo;
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

        public class TRes : TReq
        {
            public Result _result;

            public class Result
            {
                public string resultmessage;
                public string resultcheck;
            }
        }
        
        public TRes SendQueue(TReq datas, VOCriteria buVO)
        {
            var apiURL = StaticValue.StaticValueManager.GetInstant().GetConfig("WCS_SEND_QUEUE");
            var res = RESTFulAccess.SendJson<TRes>(buVO.Logger, apiURL, RESTFulAccess.HttpMethod.POST, datas);
            return res;
        }
    }
}
