using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.Wave
{
    public class ClosedDocByWave : BaseEngine<ClosedDocByWave.TReq, List<long>>
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
                var doc = ADO.WMSDB.DocumentADO.GetInstant().Get(docID, this.BuVO);
                if (doc.EventStatus == DocumentEventStatus.WORKED)
                {
                    ADO.WMSDB.DocumentADO.GetInstant().UpdateStatusToChild(docID, DocumentEventStatus.CLOSING, null, DocumentEventStatus.CLOSED, this.BuVO);
                    res.Add(docID);
                }
            });

            new ClosedDocByWave().Execute(this.Logger, this.BuVO, new ClosedDocByWave.TReq() { docIDs = res });

            return res;
        }
    }
}
