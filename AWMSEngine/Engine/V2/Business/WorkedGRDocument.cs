using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;

namespace AWMSEngine.Engine.V2.Business.Received
{
    public class WorkedGRDocument : BaseEngine<WorkedGRDocument.TReq, AWMSModel.Criteria.NullCriteria>
    {
        public class TReq
        {
            public List<long> DocumentIDs;
        }
        protected override NullCriteria ExecuteEngine(TReq reqVO)
        {
            foreach(long docID in reqVO.DocumentIDs)
            {
                ADO.DocumentADO.GetInstant().UpdateStatusToChild(docID, null, EntityStatus.ACTIVE, DocumentEventStatus.WORKED, this.BuVO);
            }
            return null;
        }
    }
}
