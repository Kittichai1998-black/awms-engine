using AMWUtil.Exception;
using AMSModel.Criteria;
using AMSModel.Entity;
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
            var wq = ADO.WMSDB.WorkQueueADO.GetInstant().Get(reqVO.wqID, this.BuVO);
            var sto = ADO.WMSDB.StorageObjectADO.GetInstant().Get(wq.StorageObject_ID.Value, AMSModel.Constant.EnumConst.StorageObjectType.BASE, false, true, this.BuVO);
            if(wq == null || sto == null)
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Work Queue ID : " + reqVO.wqID.ToString() + " Not Found.");
            }
            var res = this.GenerateResponse(sto, wq);

            return res;
        }
    }
}
