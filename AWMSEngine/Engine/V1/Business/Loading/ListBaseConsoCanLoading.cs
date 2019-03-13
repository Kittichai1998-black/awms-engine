using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Response;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.Loading
{
    public class ListBaseConsoCanLoading : BaseEngine<ListBaseConsoCanLoading.TReq, ListBaseConsoCanLoading.TRes>
    {
        public class TReq
        {
            public long docID;
        }
        public class TRes
        {
            public List<DataItem> datas;
            public class DataItem: SPOutSTORootCanUseCriteria
            {
                public long docItemID;
                public long linkDocID;
                public bool isLoaded;
                public string issuedCode;
            }
        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var docLoadItems = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItem>("Document_ID", reqVO.docID, this.BuVO);
            if (docLoadItems.GroupBy(x => x.LinkDocument_ID).Any(x => x.Count() > 1))
                throw new AMWException(this.Logger, AMWExceptionCode.V2002, "Loading ID : " + reqVO.docID + " / LinkDocument_ID Dupplicate");

            var rootStoInLoad = ADO.StorageObjectADO.GetInstant().ListBaseInDoc(reqVO.docID, null, DocumentTypeID.LOADING, this.BuVO);
            List<TRes.DataItem> rootStoInIssueds = new List<TRes.DataItem>();
            docLoadItems.ForEach(x => {
                var rsi = ADO.StorageObjectADO.GetInstant().ListBaseInDoc(x.LinkDocument_ID, null, DocumentTypeID.GOODS_ISSUED, this.BuVO);
                var rsiList = rsi.JsonCast<List<TRes.DataItem>>();
                var docIssuedItems = ADO.DataADO.GetInstant().SelectBy<amt_Document>("ID", x.LinkDocument_ID, this.BuVO);
                rsiList.ForEach(y => {
                    y.docItemID = x.ID.Value;
                    y.linkDocID = x.LinkDocument_ID.Value;
                    y.isLoaded = rootStoInLoad.Any(z => z.id == y.id);
                    y.issuedCode = docIssuedItems[0].Code;
                });
                rootStoInIssueds.AddRange(rsiList);
            });
            
            TRes res = new TRes() { datas = rootStoInIssueds };
            
            return res;

        }
    }
}
