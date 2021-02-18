using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.Wave
{
    public class WorkedDocByWave : BaseEngine<WorkedDocByWave.TReq, List<long>>
    {
        public class TReq
        {
            public List<long> docIDs;
        }
        protected override List<long> ExecuteEngine(TReq reqVO)
        {
            var res = new List<long>();
            reqVO.docIDs.ForEach(docID =>
            {
                var docItemLists = ADO.WMSDB.DocumentADO.GetInstant().ListItemAndDisto(docID, this.BuVO);
                docItemLists.ForEach(docItem =>
                {
                    if (docItem.EventStatus == DocumentEventStatus.WORKING && docItem.DocItemStos.TrueForAll(disto => disto.Status == EntityStatus.DONE))
                    {
                        ADO.WMSDB.DocumentADO.GetInstant().UpdateItemEventStatus(docItem.ID.Value, DocumentEventStatus.WORKED, this.BuVO);
                        docItem.EventStatus = DocumentEventStatus.WORKED;
                    }
                });

                if (docItemLists.TrueForAll(x => x.EventStatus == DocumentEventStatus.WORKED))
                {
                    ADO.WMSDB.DocumentADO.GetInstant().UpdateStatusToChild(docID, DocumentEventStatus.WORKING, null, DocumentEventStatus.WORKED, this.BuVO);
                    res.Add(docID);
                }
            });

            new ClosingDocByWave().Execute(this.Logger, this.BuVO, new ClosingDocByWave.TReq() { docIDs = res });

            return res;
        }
    }
}
