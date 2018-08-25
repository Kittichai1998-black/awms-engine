using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business
{
    public class PackingListGet : BaseEngine<PackingListGet.TReq,PackingListGet.TRes>
    {
        public class TReq {
            public List<long> docIDs;
        }
        public class TRes {
            //public STOChoice
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var target = ADO.DocumentADO.GetInstant().Target(reqVO.docIDs, AWMSModel.Constant.EnumConst.DocumentTypeID.GOODS_ISSUED, this.BuVO);

            return null;
        }
    }
}
