using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.Received
{
    public class WorkingGRDocument : BaseEngine<WorkingGRDocument.TDocReq, WorkingGRDocument.TDocRes>
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

            var checkWorking = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_Document>(
                new KeyValuePair<string, object>[] {
                        new KeyValuePair<string,object>("EventStatus",DocumentEventStatus.WORKING),
                        new KeyValuePair<string,object>("DocumentType_ID",DocumentTypeID.PUTAWAY),
                        new KeyValuePair<string,object>("Status", EntityStatus.ACTIVE)
                }, this.BuVO);

            if(checkWorking.Count != 0)
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Document event status more then 1");
            }
            
            foreach (long id in reqVO.docIDs)
            {
                amt_Document doc = ADO.WMSDB.DataADO.GetInstant().SelectByID<amt_Document>(id, this.BuVO);
                if (doc == null || doc.Status == EntityStatus.REMOVE)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "DocumentID " + id);
                if (doc.Status == EntityStatus.DONE)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1002, "Document is Done");
                if (doc.Status == EntityStatus.ACTIVE && doc.EventStatus != DocumentEventStatus.NEW)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1002, "Document is " + doc.EventStatus);
                ADO.WMSDB.DocumentADO.GetInstant().UpdateStatusToChild(id,
                    DocumentEventStatus.NEW, EntityStatus.ACTIVE,
                    DocumentEventStatus.WORKING,
                    this.BuVO);

                doc.EventStatus = DocumentEventStatus.WORKING;
                doc.Status = EntityStatus.ACTIVE;
                res.documents.Add(doc);
            }

            return res;
        }

    }
}
