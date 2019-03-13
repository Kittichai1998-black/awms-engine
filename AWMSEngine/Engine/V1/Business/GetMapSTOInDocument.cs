using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business
{
    public class GetMapSTOInDocument : BaseEngine<GetMapSTOInDocument.TReq, GetMapSTOInDocument.TRes>
    {
        public class TReq
        {
            public long? docID;
            public long? docItemID;
            public DocumentTypeID? docTypeID;
        }

        public class TRes
        {
            public List<StorageObjectCriteria> mapstos;
        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            TRes res = new TRes();
            res.mapstos = ADO.StorageObjectADO.GetInstant().ListInDoc(reqVO.docID, reqVO.docItemID,reqVO.docTypeID, this.BuVO);
            return res;
        }

    }
}
