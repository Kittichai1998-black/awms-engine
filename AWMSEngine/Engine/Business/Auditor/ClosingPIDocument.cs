using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.Auditor
{

    public class ClosingPIDocument : BaseEngine<ClosingPIDocument.TDocReq, NullCriteria>
    {
        public class TDocReq
        {
            public long docID;
            public int auto;
        }

        protected override NullCriteria ExecuteEngine(TDocReq reqVO)
        {
            var doc = ADO.DataADO.GetInstant().SelectByID<amv_Document>(reqVO.docID, this.BuVO);

            if (doc.Status == 0)
            {

                ADO.DocumentADO.GetInstant().updateStatus(reqVO.docID, EntityStatus.REMOVE, this.BuVO);
            }


            if (doc == null || doc.Status == EntityStatus.REMOVE)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "DocumnetID " + doc.ID);

            if (reqVO.auto == 0)
            {
                if (doc.EventStatus != DocumentEventStatus.WORKED && doc.EventStatus != DocumentEventStatus.CLOSING && doc.EventStatus != DocumentEventStatus.CLOSED)
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.V1002, "เอกสารไม่อยู่ในสถานะ WORKED ไม่สามารถ Close เอกสารได้ ");
                }

                var docItem = ADO.DataADO.GetInstant().SelectBy<amv_DocumentItem>(new KeyValuePair<string, object>[] {
                    new KeyValuePair<string, object> ("Document_ID",reqVO.docID)
                    }, this.BuVO);


                ADO.DocumentADO.GetInstant().UpdateStatusToChild(doc.ID.Value,
                null, null,
                DocumentEventStatus.CLOSING,
                this.BuVO);
            }
            else
            {
                if (doc.EventStatus != DocumentEventStatus.WORKING && doc.EventStatus != DocumentEventStatus.WORKED && doc.EventStatus != DocumentEventStatus.CLOSING && doc.EventStatus != DocumentEventStatus.CLOSED)
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.V1002, "เอกสารไม่อยู่ในสถานะ WORKING และ WORKED ไม่สามารถ Close เอกสารได้ ");
                }

                var docItem = ADO.DataADO.GetInstant().SelectBy<amv_DocumentItem>(new KeyValuePair<string, object>[] {
                    new KeyValuePair<string, object> ("Document_ID",reqVO.docID)
                    }, this.BuVO);


                ADO.DocumentADO.GetInstant().UpdateStatusToChild(doc.ID.Value,
                null, null,
                DocumentEventStatus.CLOSING,
                this.BuVO);
            }
            return null;
        }
    }
}
