using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSModel.Criteria;

namespace AWMSEngine.Engine.Business
{
    public class DocGoodsReceivedClose : BaseEngine<DocGoodsReceivedClose.TReq, AWMSModel.Criteria.NullCriteria>
    {
        public class TReq
        {
            public long DocumentID;
        }
        protected override NullCriteria ExecuteEngine(TReq reqVO)
        {
            ADO.DocumentADO.GetInstant().Close(reqVO.DocumentID, false, this.BuVO);
            return null;
        }
    }
}
