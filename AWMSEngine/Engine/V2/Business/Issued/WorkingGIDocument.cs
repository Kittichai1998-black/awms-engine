using AMWUtil.Common;
using AMWUtil.Exception;
using AMSModel.Constant.EnumConst;
using AMSModel.Constant.StringConst;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.Issued
{
    public class WorkingGIDocument : BaseEngine<WorkingGIDocument.TDocReq, WorkingGIDocument.TDocRes>
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
            foreach(long id in reqVO.docIDs)
            {
                amt_Document doc = ADO.WMSDB.DataADO.GetInstant().SelectByID<amt_Document>(id, this.BuVO);
                if (doc == null || doc.Status == EntityStatus.REMOVE)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "DocumnetID " + id);
                if (doc.Status == EntityStatus.DONE)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1002, "Documnet is Done");
                if (doc.Status == EntityStatus.ACTIVE && doc.EventStatus != DocumentEventStatus.NEW)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1002, "Documnet is " + doc.EventStatus);
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
