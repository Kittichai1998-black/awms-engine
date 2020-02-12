using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.Engine;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Response;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectPanKan.Engine.Business
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
                //public long docItemID;
                public long linkDocID;
                public bool isLoaded;
                public string issuedCode;
            }
        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var distoLD = AWMSEngine.ADO.DocumentADO.GetInstant().ListItemAndDisto(reqVO.docID, this.BuVO);
            if (distoLD.GroupBy(x => x.LinkDocument_ID).Any(x => x.Count() > 1))
                throw new AMWException(this.Logger, AMWExceptionCode.V2002, "Loading ID : " + reqVO.docID + " / LinkDocument_ID Dupplicate");

            var rootStoInLoad = AWMSEngine.ADO.StorageObjectADO.GetInstant().ListBaseInDoc(reqVO.docID, null, DocumentTypeID.LOADING, this.BuVO);
            List<TRes.DataItem> rootStoInIssueds = new List<TRes.DataItem>();

            foreach (var docStos in distoLD)
            {
                docStos.DocItemStos.ForEach(disto =>
                {
                    var rsi = AWMSEngine.ADO.StorageObjectADO.GetInstant().ListBaseInDoc(docStos.LinkDocument_ID, null, DocumentTypeID.GOODS_ISSUED, this.BuVO);
                    var rsiList = rsi.JsonCast<List<TRes.DataItem>>();
                    var docIssuedItems = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_Document>("ID", docStos.LinkDocument_ID, this.BuVO);

                    
                    rsiList.ForEach(y => {
                        y.docItemID = docStos.ID.Value;
                        y.linkDocID = docStos.LinkDocument_ID.Value;
                        y.isLoaded = rootStoInLoad.Any(z => z.sou_id == y.sou_id ) && disto.Status == EntityStatus.ACTIVE;
                        y.issuedCode = docIssuedItems[0].Code;
                    });
                    rootStoInIssueds.AddRange(rsiList);
                });
            }


            
            TRes res = new TRes() { datas = rootStoInIssueds };
            
            return res;

        }
    }
}
