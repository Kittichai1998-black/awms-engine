using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Response;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.Issued
{
    public class ProcessQueueIssue : BaseEngine<ProcessQueueIssue.TReq, ProcessQueueIssue.TRes>
    {

        public class TReq
        {
            public long docID;
            public DocumentTypeID docTypeID;
            public string refID;
            public int pickOrderType;//0=FIFO,1=LIFO
            public string orderBy;//ชื่อ Field สำหรับ order by
            public string ref2;
            public string batch;
            public string orderNo;
            public int priority;
        }
      
        public class TRes
        {
            public ViewDocument document;
            public class ViewDocument : amv_Document
            {
                public List<amv_DocumentItem> documentItems;
            }
            public List<SPOutSTORootCanUseCriteria> bstos;
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            TRes res = new TRes();
            var doc = ADO.DataADO.GetInstant().SelectBy<TRes.ViewDocument>("amv_Document", "*", null,
                new SQLConditionCriteria[]
                {
                    new SQLConditionCriteria("ID", reqVO.docID, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("DocumentType_ID", reqVO.docTypeID, SQLOperatorType.EQUALS)
                },
                new SQLOrderByCriteria[] { }, null, null,
                this.BuVO).FirstOrDefault();
            if (doc == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V2001, "ไม่พบเอกสารในระบบ");
            var docItems = ADO.DataADO.GetInstant().SelectBy<amv_DocumentItem>(
                new SQLConditionCriteria[]
                {
                    new SQLConditionCriteria("Document_ID",doc.ID, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Status",EntityStatus.REMOVE, SQLOperatorType.NOTEQUALS),
                },
                this.BuVO);

            ADO.DocumentADO.GetInstant().UpdateStatusToChild(reqVO.docID,DocumentEventStatus.IDLE,
                    EntityStatus.INACTIVE,
                    DocumentEventStatus.WORKING,
                    this.BuVO);

            doc.EventStatus = DocumentEventStatus.WORKING;
            doc.Status = EntityStatus.ACTIVE;
            //res.documents.Add(doc);

            //doc.documentItems = docItems;
            res.document = doc;

            return res;
            
        }
    }
}
