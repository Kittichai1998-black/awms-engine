using AMWUtil.Exception;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.WorkQueue
{
    public class EnquiryWorkQueue : BaseQueue<EnquiryWorkQueue.TReq, WorkQueueCriteria>
    {
        public class TReq {
            public long wqID;
        }

        protected override WorkQueueCriteria ExecuteEngine(TReq reqVO)
        {
            var wq = ADO.WorkQueueADO.GetInstant().Get(reqVO.wqID, this.BuVO);
            var sto = ADO.StorageObjectADO.GetInstant().Get(wq.StorageObject_ID.Value, AWMSModel.Constant.EnumConst.StorageObjectType.BASE, false, true, this.BuVO);
            if(wq == null || sto == null)
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Work Queue ID : " + reqVO.wqID.ToString() + " Not Found.");
            }
            var res = this.GenerateResponse(sto, wq);

            return res;
        }
    }
}
