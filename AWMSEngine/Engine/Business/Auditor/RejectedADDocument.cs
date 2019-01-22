using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.Auditor
{
    public class RejectedADDocument : BaseEngine<RejectedADDocument.TReq, List<amt_Document>>
    {
        public class TReq
        {
            public long[] docIDs;
        }

        protected override List<amt_Document> ExecuteEngine(TReq reqVO)
        {
            List<amt_Document> docs = new List<amt_Document>();
            foreach(var docID in reqVO.docIDs)
            {
                var getDoc = ADO.DocumentADO.GetInstant().Get(docID, this.BuVO);
                if (getDoc.EventStatus == DocumentEventStatus.REJECTED)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "เอกสารอยู่ในสถานะ " + getDoc.EventStatus);
                else if (getDoc.EventStatus == DocumentEventStatus.WORKED || getDoc.EventStatus == DocumentEventStatus.WORKED)
                    throw new AMWException(this.Logger, AMWExceptionCode.B0001, "เอกสารอยู่ในสถานะ " + getDoc.EventStatus);
                else if (getDoc.EventStatus == DocumentEventStatus.CLOSED || getDoc.EventStatus == DocumentEventStatus.CLOSING)
                    throw new AMWException(this.Logger, AMWExceptionCode.B0001, "เอกสารนี่ทำเสร็จแล้ว ไม่สามารถยกเลิกได้");
                else if (getDoc.EventStatus == DocumentEventStatus.IDLE)
                    ADO.DocumentADO.GetInstant().UpdateStatusToChild(docID, null, null, DocumentEventStatus.REJECTED, this.BuVO);

                getDoc.EventStatus = DocumentEventStatus.REJECTED;
                getDoc.Status = EntityStatus.REMOVE;

                docs.Add(getDoc);
            }
            return docs;
        }
    }
}
