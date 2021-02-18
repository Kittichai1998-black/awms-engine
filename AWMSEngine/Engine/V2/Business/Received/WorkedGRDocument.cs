using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;

namespace AWMSEngine.Engine.V2.Business.Received
{
    public class WorkedGRDocument : BaseEngine<WorkedGRDocument.TReq, AMSModel.Criteria.NullCriteria>
    {
        public class TReq
        {
            public List<long> DocumentIDs;
        }
        protected override NullCriteria ExecuteEngine(TReq reqVO)
        {
            foreach(long docID in reqVO.DocumentIDs)
            {
                ADO.WMSDB.DocumentADO.GetInstant().UpdateStatusToChild(docID, null, EntityStatus.ACTIVE, DocumentEventStatus.WORKED, this.BuVO);
            }
            return null;
        }
    }
}
