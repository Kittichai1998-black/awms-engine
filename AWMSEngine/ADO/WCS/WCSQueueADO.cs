using AMWUtil.Common;
using AMWUtil.DataAccess.Http;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.ADO.QueueApi
{
    public class WCSQueueADO : BaseAPIAccess<WCSQueueADO>
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
                    public StorageObjectEventStatus eventStatus;
                    public List<packinfo> packInfos;
                    public string pickSeqGroup;
                    public long? pickSeqIndex;
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
                public dynamic resultmessage;
                public int resultcheck;
            }
        }
        public class TReqCheckQueue
        {
            public long[] queueID;
        }
        public class TResCheckQueue
        {
            public List<CheckQueue> data;
            public class CheckQueue
            {
                public long queueID;
                public WCSQueueStatus status;
            }
            public Result _result;

            public class Result
            {
                public dynamic resultmessage;
                public int resultcheck;
            }
           
        }

        public TRes SendQueue(TReq datas, VOCriteria buVO)
        {
            //return new TRes() { _result = new TRes.Result() { resultcheck = 1, resultmessage = "SUCCESS" } };
            var res = this.SendJson<TRes>("WCS.WCS_SEND_QUEUE", datas, null, buVO);
            return res;
        }


        public TRes SendReady(TReq datas, VOCriteria buVO)
        {
            //return new TRes() { _result = new TRes.Result() { resultcheck = 1, resultmessage = "SUCCESS" } };
            var d = datas.Clone();
            d.queueOut.ForEach(x => x.queueID = null);
            var res = this.SendJson<TRes>("WCS.WCS_SEND_QUEUE", d, null, buVO);
            return res;
        }
        public TResCheckQueue SendCheckQueue(TReqCheckQueue queueID, VOCriteria buVO)
        {
            return new TResCheckQueue() { _result = new TResCheckQueue.Result() { resultcheck = 1, resultmessage = "SUCCESS" },data = new List<TResCheckQueue.CheckQueue>() };
            //var res = this.SendJson<TRes>("WCS_CHECK_QUEUE", datas, null, buVO);
            //return res;
        }
    }
}
