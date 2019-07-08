﻿using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.Issued
{
    public class RejectedGIDocumnet : BaseEngine<RejectedGIDocumnet.TReq, RejectedGIDocumnet.TRes>
    {

        public class TReq
        {
            public List<long> docIDs;
        }
        public class TRes
        {
            public List<amt_Document> documents;
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {

            var docIssues = ADO.DocumentADO.GetInstant().ListAndRelationSupper(reqVO.docIDs, this.BuVO);
            var docNotCloseds = docIssues.Where(x => x.EventStatus != DocumentEventStatus.NEW);
            if (docNotCloseds.Count() > 0)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "เอกสารรับเข้า '" + (string.Join(',', docNotCloseds.Select(x => x.Code).ToArray())) + "' ต้องมีสถานะ New เท่านั้น");
            
            docIssues.ForEach(doc =>
            {
                doc.EventStatus = DocumentEventStatus.REJECTED;
                doc.Status = ADO.DocumentADO.GetInstant().UpdateStatusToChild(doc.ID.Value, null, EntityStatus.ACTIVE, DocumentEventStatus.REJECTED, this.BuVO);
                
            });
            return new TRes { documents= docIssues };
        }
        
    }
}
