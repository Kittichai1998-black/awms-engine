using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.ADO;
using AWMSEngine.ADO.StaticValue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Request;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.WorkQueue
{
    public class EnquiryQueue : BaseQueue<EnquiryQueue.TReq, WorkQueueCriteria>
    {
        public class TReq
        {
            public long queueID;
            public string baseCode;
        }
        protected override WorkQueueCriteria ExecuteEngine(TReq reqVO)
        {
            var queueTrx = ADO.WorkQueueADO.GetInstant().Get(reqVO.queueID, this.BuVO);
            var mapsto = ADO.StorageObjectADO.GetInstant().Get(queueTrx.StorageObject_ID.Value, StorageObjectType.BASE, false, true, this.BuVO);
            
            var res = this.GenerateResponse(mapsto, queueTrx);
            return res;
        }
       
    }
}
