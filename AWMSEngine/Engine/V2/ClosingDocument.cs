using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business
{
    public class ClosingDocument : BaseEngine<ClosingDocument.TDocReq, NullCriteria>
    {
        public class TDocReq
        {
            public long[] docIDs;
        }

        protected override NullCriteria ExecuteEngine(TDocReq reqVO)
        {
            foreach (var docID in reqVO.docIDs)
            {
                var doc = ADO.DataADO.GetInstant().SelectByID<amt_Document>(docID, this.BuVO);

                if (doc == null || doc.Status == EntityStatus.REMOVE)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "DocumnetID " + docID + " Not Found or Status : REMOVE");

                var disto = ADO.DocumentADO.GetInstant().ListStoInDocs(docID, this.BuVO);

                if (disto.Any(x => x.Status == EntityStatus.INACTIVE))
                    throw new AMWException(this.Logger, AMWExceptionCode.V1002, "Document " + doc.Code + " has not been completed");

                if (doc.EventStatus != DocumentEventStatus.WORKED && doc.EventStatus != DocumentEventStatus.CLOSING && doc.EventStatus != DocumentEventStatus.CLOSED)
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.V1002, "The document status is not WORKED, Cannot close the document");
                }

                ADO.DocumentADO.GetInstant().UpdateStatusToChild(doc.ID.Value,
                null, null,
                DocumentEventStatus.CLOSING,
                this.BuVO);
            }
            return null;
        }
    }
}
