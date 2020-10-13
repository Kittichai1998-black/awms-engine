using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.Auditor
{
    public class GetSTOAudit : BaseEngine<GetSTOAudit.TReq, GetSTOAudit.TRes>
    {
        public class TReq
        {
            public long? bstoID;
            public string bstoCode;
        }
        public class TRes
        {
            public List<long> docIDs;
            public string bstoCode;
            public long bstoID;
            public List<STOItems> stoItems;
            public class STOItems
            {
                public long? bstoID;
                public long pstoID;
                public string pstoCode;
                public string pstoName;
                public AuditStatus auditStatus;
                public string lot;
                public string cartonNo;
                public string orderNo;
                public string batch;
                public string itemNo;
                public string ref1;
                public string ref2;
                public string ref3;
                public string ref4;
                public long? pi_docID;
                public string pi_docCode;
                public long? pi_docItemID;
                public long? distoID;
                public DocumentProcessTypeID processTypeID;
                public string processTypeName;
                public decimal? auditQty;
                public string unitCode;
                public decimal? coutingBaseQty;
                public string baseUnitCode;
                public string remark;

            }
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            TRes res = new TRes();
            var getSto = new StorageObjectCriteria();
            if (reqVO.bstoCode == null)
            {
                if (reqVO.bstoID != null)
                {
                    getSto = ADO.WMSDB.StorageObjectADO.GetInstant().Get(reqVO.bstoID.Value, StorageObjectType.BASE, false, true, this.BuVO);
                }
                else
                {
                    throw new AMWException(Logger, AMWExceptionCode.V1001, "กรุณาระบุรหัสพาเลทที่ต้องการตรวจสอบ");
                }
            }
            else
            {
                getSto = ADO.WMSDB.StorageObjectADO.GetInstant().Get(reqVO.bstoCode, null, null, false, true, this.BuVO);
            }
            if (getSto == null)
                return null;

            var packsList = getSto.ToTreeList().Where(x => x.type == StorageObjectType.PACK && x.eventStatus == StorageObjectEventStatus.AUDITING).ToList();
            if (packsList.Count == 0)
                return null;

            var listDocs = ADO.WMSDB.DocumentADO.GetInstant().ListDocumentCanAudit(getSto.code, StorageObjectEventStatus.AUDITING, DocumentTypeID.AUDIT, this.BuVO);
            if (listDocs.Count > 0)
            {
                var newDocs = listDocs.Where(x => x.DocumentProcessType_ID == DocumentProcessTypeID.PM_QUALITY_CONTROL_WM  || x.DocumentProcessType_ID == DocumentProcessTypeID.FG_QUALITY_CONTROL_WM).ToList();
                if (newDocs.Count == 0)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่เอกสารการเบิกจ่ายเพื่อตรวจสอบคุณภาพ");

                res.stoItems = new List<TRes.STOItems>();
                newDocs.ForEach(doc => {
                    //var distos = ADO.WMSDB.DocumentADO.GetInstant().ListStoInDocs(doc.ID.Value, this.BuVO);
                    var docItems = ADO.WMSDB.DocumentADO.GetInstant().ListItemAndDisto(doc.ID.Value, this.BuVO);
                    var distoList = new List<amt_DocumentItemStorageObject>();
                    docItems.ForEach(x => { 
                        distoList.AddRange(x.DocItemStos.FindAll(y=>y.Status == EntityStatus.INACTIVE)); 
                    });

                    distoList.ForEach(disto => {

                        var pack = packsList.Find(pack => pack.id.Value == disto.Sou_StorageObject_ID);
                        if (pack != null)
                        {
                            var processType = ADO.WMSDB.DataADO.GetInstant().SelectBy<amv_DocumentProcessTypeMap>(new SQLConditionCriteria[] {
                                    new SQLConditionCriteria("DocumentType_ID", DocumentTypeID.AUDIT,SQLOperatorType.EQUALS),
                                    new SQLConditionCriteria("DocumentProcessType_ID", doc.DocumentProcessType_ID,SQLOperatorType.EQUALS),
                                    new SQLConditionCriteria("Status", EntityStatus.ACTIVE,SQLOperatorType.EQUALS)
                                }, this.BuVO).FirstOrDefault();
                            if (processType == null)
                                throw new AMWException(Logger, AMWExceptionCode.V1001, "ไม่พบข้อมูล Document Process Type Map");

                            var processTypeName = String.IsNullOrEmpty(processType.ReProcessType_Name) ? processType.Name : processType.ReProcessType_Name;

                            var packItem = new TRes.STOItems()
                            {
                                pstoID = pack.id.Value,
                                pstoCode = pack.code,
                                pstoName = pack.name,
                                batch = pack.batch,
                                lot = pack.lot,
                                orderNo = pack.orderNo,
                                cartonNo = pack.cartonNo,
                                itemNo = pack.itemNo,
                                ref1 = pack.ref1,
                                ref2 = pack.ref2,
                                ref3 = pack.ref3,
                                ref4 = pack.ref4,
                                auditStatus = pack.AuditStatus,
                                bstoID = pack.parentID,
                                pi_docID = doc.ID,
                                pi_docCode = doc.Code,
                                pi_docItemID = disto.DocumentItem_ID.Value,
                                processTypeID = doc.DocumentProcessType_ID,
                                processTypeName = processTypeName,
                                distoID = disto.ID.Value,
                                auditQty = pack.qty,
                                coutingBaseQty = pack.baseQty,
                                unitCode = pack.unitCode,
                                baseUnitCode = pack.baseUnitCode,
                                remark = doc.Remark,
                            };
                            res.stoItems.Add(packItem);
                        }
                    });



                });
                res.bstoCode = getSto.code;
                res.bstoID = getSto.id.Value;
            }
            else
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่เอกสารการเบิกจ่ายเพื่อตรวจสอบคุณภาพ");
            }
            return res;
        }

    }
}
