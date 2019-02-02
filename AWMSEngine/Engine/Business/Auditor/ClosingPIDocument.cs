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
            public long[] docIDs;
            public int auto;
        }

        protected override NullCriteria ExecuteEngine(TDocReq reqVO)
        {
            foreach (var docID in reqVO.docIDs)
            {
                var doc = ADO.DataADO.GetInstant().SelectByID<amv_Document>(docID, this.BuVO);

                if (doc.Status == 0)
                {

                    ADO.DocumentADO.GetInstant().UpdateEventStatus(docID, DocumentEventStatus.REMOVED, this.BuVO);
                }


                if (doc == null || doc.Status == EntityStatus.REMOVE)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "DocumnetID " + doc.ID);

                if (doc.EventStatus != DocumentEventStatus.WORKING && doc.EventStatus != DocumentEventStatus.WORKED && doc.EventStatus != DocumentEventStatus.CLOSING && doc.EventStatus != DocumentEventStatus.CLOSED)
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.V1002, "เอกสารไม่อยู่ในสถานะ WORKING และ WORKED ไม่สามารถ Close เอกสารได้ ");
                }

                var disto = ADO.DocumentADO.GetInstant().ListStoInDocs(docID, this.BuVO);

                if(disto.Any(x => x.Status == EntityStatus.INACTIVE))//CHANGE BY TOM
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.V1002, "สินค้ายังถูกตรวจสอบไม่ครบ ไม่สามารถปิดเอกสารได้");
                }

                var docItem = ADO.DataADO.GetInstant().SelectBy<amv_DocumentItem>(new KeyValuePair<string, object>[] {
                    new KeyValuePair<string, object> ("Document_ID",docID)
                    }, this.BuVO);

                ADO.DocumentADO.GetInstant().UpdateStatusToChild(doc.ID.Value,
                null, null,
                DocumentEventStatus.CLOSING,
                this.BuVO);

                var baseSto = ADO.StorageObjectADO.GetInstant().ListBaseInDoc(docID, (long?)null, DocumentTypeID.AUDIT, this.BuVO).Where(x => x.areaID == 8 && (x.areaLocationCode != null || x.areaLocationCode == "")).ToList();
                baseSto.ForEach(x => {
                    ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(x.id, StorageObjectEventStatus.AUDITED, null, StorageObjectEventStatus.RECEIVED, this.BuVO);
                });
            }
            return null;
        }
    }
}
