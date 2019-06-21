using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.WorkQueue
{
    public class ASRSConfirmQueue : BaseEngine<ASRSConfirmQueue.TReq, ASRSConfirmQueue.TRes>
    {

        public class TReq : ASRSProcessQueue.TRes
        {
        }
        public class TRes
        {
        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var docs = ADO.DocumentADO.GetInstant().ListAndItem(reqVO.processResults.GroupBy(x => x.docID).Select(x => x.Key).ToList(), this.BuVO);
            this.ValidateDoc(docs);
            foreach(var proc in reqVO.processResults)
            {

                long workqueue_id = 0;
                foreach (var procItem in proc.processResultItems)
                {
                    var distos = procItem.pickStos.Select(x => new amt_DocumentItemStorageObject()
                    {
                        WorkQueue_ID= workqueue_id,
                        BaseQuantity = x.pstoBaseQty,
                    }).ToList();
                    ADO.DocumentADO.GetInstant().InsertMappingSTO(distos, this.BuVO);
                }
            };
            return null;
        }

        private void ValidateDoc(List<amt_Document> docs)
        {
            docs.ForEach(x =>
            {
                if(x.EventStatus != DocumentEventStatus.NEW)
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.B0001, "'" + x.Code + "' is not NEW.");
                }
            });
        }
    }
}
