using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.Wave
{
    public class ClosingDocByWave : BaseEngine<ClosingDocByWave.TReq, List<long>>
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
                var doc = ADO.DocumentADO.GetInstant().Get(docID, this.BuVO);
                if (doc.EventStatus == DocumentEventStatus.WORKED)
                {
                    ADO.DocumentADO.GetInstant().UpdateStatusToChild(docID, DocumentEventStatus.WORKED, null, DocumentEventStatus.CLOSING, this.BuVO);
                    res.Add(docID);
                }
            });
            return res;
        }
    }
}
