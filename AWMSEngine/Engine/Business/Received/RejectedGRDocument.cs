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

namespace AWMSEngine.Engine.Business.Received
{
    public class RejectedGRDocument : BaseEngine<RejectedGRDocument.TDocReq, RejectedGRDocument.TDocRes>
    {

        public class TDocReq
        {
            public long[] docIDs;
        }
        public class TDocRes
        {
            public List<amt_Document> documents;
        }

        protected override TDocRes ExecuteEngine(TDocReq reqVO)
        {
            TDocRes res = new TDocRes();
            res.documents = new List<amt_Document>();
            foreach (long id in reqVO.docIDs)
            {
                amt_Document doc = ADO.DataADO.GetInstant().SelectByID<amt_Document>(id, this.BuVO);

                if (doc == null || doc.Status == EntityStatus.REMOVE)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "DocumnetID " + id);


                if ( doc.EventStatus == DocumentEventStatus.WORKED)
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.V1002, "สินค้าถูกรับเข้าเรียบร้อยแล้ว");
                }

                if (doc.EventStatus == DocumentEventStatus.CLOSING || doc.EventStatus == DocumentEventStatus.CLOSED)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1002, "เอกสารอยู่ในสถานะ " + doc.EventStatus);

                if (doc.Status == EntityStatus.ACTIVE && doc.EventStatus != DocumentEventStatus.IDEL && doc.EventStatus != DocumentEventStatus.WORKING)
                {
                    var stos = ADO.DocumentADO.GetInstant().ListStoInDocs(doc.ID.Value, this.BuVO);
                    if (stos.Count > 0)
                        throw new AMWException(this.Logger, AMWExceptionCode.V1002, "Documnet is " + doc.EventStatus);
                }



                List<amt_DocumentItem> linkDocItems = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItem>(
                                                        new SQLConditionCriteria[] {
                                                            new SQLConditionCriteria("LinkDocument_ID",doc.ID, SQLOperatorType.EQUALS),
                                                            new SQLConditionCriteria("Status",2, SQLOperatorType.NOTEQUALS)
                                                        }, this.BuVO);
                if (linkDocItems.Count > 0)
                {
                    string[] docConfixs = ADO.DataADO.GetInstant().SelectBy<amt_Document>(
                        new SQLConditionCriteria[] {
                            new SQLConditionCriteria("ID",string.Join(",",linkDocItems.Select(x=>x.Document_ID).ToArray()), SQLOperatorType.IN)
                        }, this.BuVO).Select(x => x.Code).ToArray();
                    throw new AMWException(this.Logger, AMWExceptionCode.V1002, "กรุณา Reject เอกสาร '" + string.Join(',', docConfixs) + "' ก่อน");

                }


                var stoToReceives = ADO.DocumentADO.GetInstant().ListStoInDocs(doc.ID.Value, this.BuVO);
                var stoLasters = ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>(
                        new SQLConditionCriteria[] {
                            new SQLConditionCriteria("ID",string.Join(",",stoToReceives.Select(x=>x.StorageObject_ID).ToArray()), SQLOperatorType.IN)
                        }, this.BuVO);
                var rootStoToReceives = stoLasters.Where(x => x.Status == EntityStatus.ACTIVE || x.Status == EntityStatus.DONE)
                    .GroupBy(x => x.ParentStorageObject_ID ?? x.ID)
                    .Select(x => x.Key.Value);

                rootStoToReceives.ToList().ForEach(x =>
                {
                    ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(x, null, EntityStatus.ACTIVE, StorageObjectEventStatus.RECEIVED, this.BuVO);
                    ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(x, null, EntityStatus.DONE, StorageObjectEventStatus.RECEIVED, this.BuVO);
                });

                ADO.DocumentADO.GetInstant().UpdateStatusToChild(id,
                    null, null,
                    DocumentEventStatus.REJECTED,
                    this.BuVO);


                doc.EventStatus = DocumentEventStatus.REJECTED;
                doc.Status = EntityStatus.REMOVE;
                res.documents.Add(doc);
            }

            return res;
        }

    }
}
