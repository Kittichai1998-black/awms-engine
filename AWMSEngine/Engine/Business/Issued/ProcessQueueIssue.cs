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
            public List<documentProces> documentsProces;
            public class documentProces
            {
                public long docID;
                public string refID;
                public int pickOrderType;//0=FIFO,1=LIFO
                public string orderBy;//ชื่อ Field สำหรับ order by
                public string ref2;
                public string batch;
                public string orderNo;
                public int priority;
            }
        }
      
        public class TRes
        {
            public ViewDocument document;
            public class ViewDocument : amv_Document
            {
                public List<amv_DocumentItem> documentItems;
            }
            public List<SPOutSTORootCanUseCriteria> bstos;

            public List<TData> datas;
            public class TData
            {
                public long id;
                public string code;
                public int areaID;
                public string areaCode;
                public int? areaLocationID;
                public string areaLocationCode;
                public int warehouseID;
                public string warehouseCode;
                public int branchID;
                public string branchCode;
                public int packQty;
                public DateTime createTime;
                public string batch;
                public string strPackQty;
            }
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            TRes res = new TRes();
            List<amv_DocumentItem> DocItems = new List<amv_DocumentItem>();
            DocumentEventStatus[] DocEventStatuses = new DocumentEventStatus[] { DocumentEventStatus.IDEL, DocumentEventStatus.WORKING};
            foreach (var docsProcess in reqVO.documentsProces)
            {
                var doc = ADO.DataADO.GetInstant().SelectBy<TRes.ViewDocument>("amv_Document", "*", null,
                new SQLConditionCriteria[]
                {
                    new SQLConditionCriteria("ID", docsProcess.docID, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("DocumentType_ID", DocumentTypeID.GOODS_ISSUED, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("EventStatus",DocEventStatuses, SQLOperatorType.IN)
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

                DocItems.AddRange(docItems);
                doc.documentItems = DocItems;
              
                res.document = doc;
            }
            res.datas = new List<TRes.TData>();

            List<SPOutSTORootCanUseCriteria> stos = ADO.StorageObjectADO.GetInstant().ListRootFree(this.BuVO);
            var datas = stos
                .GroupBy(x => new {
                    x.id,
                    x.code,
                    x.areaID,
                    x.areaCode,
                    x.areaLocationID,
                    x.areaLocationCode,
                    x.branchID,
                    x.branchCode,
                    x.warehouseID,
                    x.warehouseCode,
                    x.createTime,
                    x.batch
                })
                    
                .Select(x => new TRes.TData()
                {
                    id = x.Key.id,
                    code = x.Key.code,
                    areaID = x.Key.areaID,
                    areaCode = x.Key.areaCode,
                    areaLocationID = x.Key.areaLocationID,
                    areaLocationCode = x.Key.areaLocationCode,
                    branchID = x.Key.branchID,
                    branchCode = x.Key.branchCode,
                    warehouseID = x.Key.warehouseID,
                    warehouseCode = x.Key.warehouseCode,
                    packQty = x.Sum(y => y.packQty),
                    createTime = x.Key.createTime,
                    batch = x.Key.batch
                })
                .OrderBy(x => x.createTime)
                .ToList();

            res.datas.AddRange(datas);
            foreach (var value in res.datas)
            {
                res.datas[0].strPackQty = "packQty : " + value.packQty.ToString();
            }

            return res;
            
        }
    }
}
