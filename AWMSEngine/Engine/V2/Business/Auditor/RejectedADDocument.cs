using AMWUtil.Exception;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.Auditor
{
    public class RejectedADDocument : BaseEngine<RejectedADDocument.TReq, List<amt_Document>>
    {
        public class TReq
        {
            public long[] docIDs;
            public string remark;
        }

        protected override List<amt_Document> ExecuteEngine(TReq reqVO)
        {
            List<amt_Document> docs = new List<amt_Document>();
            foreach(var docID in reqVO.docIDs)
            {
                var getDoc = ADO.WMSDB.DocumentADO.GetInstant().Get(docID, this.BuVO);
                if (getDoc.EventStatus == DocumentEventStatus.REJECTED)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "เอกสารอยู่ในสถานะ " + getDoc.EventStatus);
                else if (getDoc.EventStatus == DocumentEventStatus.WORKED || getDoc.EventStatus == DocumentEventStatus.WORKED)
                    throw new AMWException(this.Logger, AMWExceptionCode.B0001, "เอกสารอยู่ในสถานะ " + getDoc.EventStatus);
                else if (getDoc.EventStatus == DocumentEventStatus.CLOSED || getDoc.EventStatus == DocumentEventStatus.CLOSING)
                    throw new AMWException(this.Logger, AMWExceptionCode.B0001, "เอกสารนี่ทำเสร็จแล้ว ไม่สามารถยกเลิกได้");
                else if (getDoc.EventStatus == DocumentEventStatus.NEW)
                    ADO.WMSDB.DocumentADO.GetInstant().UpdateStatusToChild(docID, null, null, DocumentEventStatus.REJECTED, this.BuVO);

                getDoc.EventStatus = DocumentEventStatus.REJECTED;
                getDoc.Status = EntityStatus.REMOVE;

                ADO.WMSDB.DataADO.GetInstant().UpdateByID<amt_Document>(docID, this.BuVO,
                new KeyValuePair<string, object>[]
                {
                    new KeyValuePair<string, object>("remark",reqVO.remark)
                });
                docs.Add(getDoc);
            }
            return docs;
        }
    }
}
