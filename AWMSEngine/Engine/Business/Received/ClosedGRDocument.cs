using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSModel.Criteria;

namespace AWMSEngine.Engine.Business.Received
{
    public class ClosedGRDocument : BaseEngine<ClosedGRDocument.TReq, AWMSModel.Criteria.NullCriteria>
    {
        public class TReq
        {
            public List<long> DocumentIDs;
        }
        protected override NullCriteria ExecuteEngine(TReq reqVO)
        {
            foreach(long docID in reqVO.DocumentIDs)
            {
                ADO.DocumentADO.GetInstant().Close(docID, false, this.BuVO);
            }
            return null;
        }
    }
}
