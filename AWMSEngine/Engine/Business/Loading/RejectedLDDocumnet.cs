using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.Loading
{
    public class RejectedLDDocumnet : BaseEngine<RejectedLDDocumnet.TDocReq, RejectedLDDocumnet.TDocRes>
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
                amt_Document doc = ADO.DataADO.GetInstant().SelectByID<amt_Document>(id, this.BuVO);
                if (doc == null || doc.Status == EntityStatus.REMOVE)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "DocumnetID " + id);
                if (doc.Status == EntityStatus.DONE)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1002, "Documnet is Done");
                if (doc.Status == EntityStatus.ACTIVE && doc.EventStatus != DocumentEventStatus.IDEL)
                {
                    var stos = ADO.DocumentADO.GetInstant().ListStoInDocs(doc.ID.Value, this.BuVO);
                    if (stos.Count > 0)
                        throw new AMWException(this.Logger, AMWExceptionCode.V1002, "Documnet is " + doc.EventStatus);
                }
                ADO.DocumentADO.GetInstant().UpdateStatusToChild(id,
                    null, EntityStatus.ACTIVE,
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
