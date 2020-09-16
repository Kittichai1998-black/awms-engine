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

namespace AWMSEngine.Engine.V2.Business.Auditor
{
    public class AuditChecker : BaseEngine<AuditChecker.TReq, GetSTOAudit.TRes>
    {
       
        public class TReq
        {
            public long bstoID;
            public long pstoID;
            public long pi_docID;
            public long pi_docItemID;
            public long distoID;
            public decimal auditQty;
            public AuditStatus auditStatus;
            public string remark;
        }
        protected override GetSTOAudit.TRes ExecuteEngine(TReq reqVO)
        {
            var doc = ADO.DocumentADO.GetInstant().Get(reqVO.pi_docID, this.BuVO);

            doc.DocumentItems = ADO.DocumentADO.GetInstant().ListItemAndDisto(reqVO.pi_docID, this.BuVO);

            var docitem = doc.DocumentItems.Find(y => y.ID == reqVO.pi_docItemID);
            if (docitem == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบเอกสารที่ต้องการตรวจสอบคุณภาพ");

            var disto = docitem.DocItemStos.Find(z => z.ID == reqVO.distoID);
            if (disto == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ DocItemStos");

            var qID = ADO.DataADO.GetInstant().SelectByID<amt_WorkQueue>(disto.WorkQueue_ID, this.BuVO);
            if (qID != null && qID.EventStatus != WorkQueueEventStatus.CLOSED)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "กรุณารอสักครู่ กระบวนการเบิกยังไม่จบการทำงาน");

            //ตัวที่เลือกaudit คือ pack sto ตั้งต้น
            var pstos = ADO.StorageObjectADO.GetInstant().Get(reqVO.pstoID, StorageObjectType.PACK, false, false, this.BuVO);
            if (pstos == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบสินค้าที่ต้องการตรวจสอบคุณภาพ");

            
            pstos.options = AMWUtil.Common.ObjectUtil.QryStrSetValue(pstos.options,
                          new KeyValuePair<string, object>[] {
                           new KeyValuePair<string, object>(OptionVOConst.OPT_REMARK, reqVO.remark)
                          });
            var newPackCheckSum = pstos.GetCheckSum();


            var bstos = ADO.StorageObjectADO.GetInstant().Get(reqVO.bstoID, StorageObjectType.BASE, false, true, this.BuVO);
            if (bstos == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบสินค้าที่ต้องการตรวจสอบคุณภาพ");
            var packsList = bstos.ToTreeList().Find(x => x.type == StorageObjectType.PACK
            && x.eventStatus == StorageObjectEventStatus.AUDITED
            && x.refID == newPackCheckSum && x.AuditStatus == reqVO.auditStatus);
            if (packsList != null)
            { //มีsto เดิมที่ข้อมูลตรงกัน
                var rmkOpt = AMWUtil.Common.ObjectUtil.QryStrGetValue(packsList.options, OptionVOConst.OPT_REMARK);
                packsList.options = String.IsNullOrEmpty(reqVO.remark) ? rmkOpt : AMWUtil.Common.ObjectUtil.QryStrSetValue(packsList.options,
                          new KeyValuePair<string, object>[] {
                           new KeyValuePair<string, object>(OptionVOConst.OPT_REMARK, reqVO.remark)
                          });
                if (pstos.qty != reqVO.auditQty)
                {

                    //จำนวนสินค้าตั้งต้น มี500 แต่อันเดทสถานะ 100 แตกsto, disto
                    packsList.qty += reqVO.auditQty;
                    var qtyConvert = StaticValue.ConvertToNewUnitBySKU(packsList.skuID.Value, packsList.qty, packsList.unitID, packsList.baseUnitID);
                    packsList.baseQty = qtyConvert.newQty;
                    ADO.StorageObjectADO.GetInstant().PutV2(packsList, this.BuVO);


                    pstos.qty -= reqVO.auditQty; //เดิม 500 ออดิตpass=200 เหลือ 300
                    var updStoqtyConvert = StaticValue.ConvertToNewUnitBySKU(pstos.skuID.Value, pstos.qty, pstos.unitID, pstos.baseUnitID);
                    pstos.baseQty = updStoqtyConvert.newQty;
                    ADO.StorageObjectADO.GetInstant().PutV2(pstos, this.BuVO);
                    ADO.DistoADO.GetInstant().Update(reqVO.distoID, pstos.id.Value, pstos.qty, pstos.baseQty, EntityStatus.INACTIVE, BuVO);
                    
                }
                else
                {
                     
                        // มีสถานะตรงกัน จำนวนที่ต้องตรวจสอบเท่ากับค่าที่เหลืออยู่ 
                        packsList.qty += reqVO.auditQty;
                        var qtyConvert = StaticValue.ConvertToNewUnitBySKU(packsList.skuID.Value, packsList.qty, packsList.unitID, packsList.baseUnitID);
                        packsList.baseQty = qtyConvert.newQty;
                        ADO.StorageObjectADO.GetInstant().PutV2(packsList, this.BuVO);

                        var distoofPack = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(new SQLConditionCriteria[] {
                                    new SQLConditionCriteria("DocumentType_ID", DocumentTypeID.AUDIT,SQLOperatorType.EQUALS),
                                    new SQLConditionCriteria("Sou_StorageObject_ID", pstos.id.Value,SQLOperatorType.EQUALS),
                                    new SQLConditionCriteria("Des_StorageObject_ID", packsList.id.Value,SQLOperatorType.EQUALS),
                                    new SQLConditionCriteria("Status", EntityStatus.DONE,SQLOperatorType.EQUALS)
                                }, this.BuVO).FirstOrDefault();
                        if (distoofPack == null)
                            throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ DocumentItemStorageObject");

                        ADO.DistoADO.GetInstant().Update(distoofPack.ID.Value, packsList.id.Value, packsList.qty, packsList.baseQty, EntityStatus.DONE, BuVO);

                        //จะ sto, distoตัวตั้งต้นออก 
                        pstos.qty = 0;
                        pstos.baseQty = 0;
                        pstos.eventStatus = StorageObjectEventStatus.REMOVED;
                        ADO.StorageObjectADO.GetInstant().PutV2(pstos, this.BuVO);
                        ADO.DistoADO.GetInstant().Update(reqVO.distoID, pstos.id.Value, pstos.qty, pstos.baseQty, EntityStatus.REMOVE, BuVO);

                     
                }
            }
            else
            {
                // สถานะไม่ตรง 
                var updSto = new StorageObjectCriteria();
                updSto = pstos.Clone();
                updSto.qty -= reqVO.auditQty; //เดิม 500 ออดิตpass=200 เหลือ 300
                var qtyConvert = StaticValue.ConvertToNewUnitBySKU(updSto.skuID.Value, updSto.qty, pstos.unitID, pstos.baseUnitID);
                updSto.baseQty = qtyConvert.newQty;

                if (updSto.qty == 0) { //audit all เปลี่ยนสถานะ 500
                    pstos.AuditStatus = reqVO.auditStatus;
                    pstos.eventStatus = StorageObjectEventStatus.AUDITED;
                    ADO.StorageObjectADO.GetInstant().PutV2(pstos, this.BuVO);

                    ADO.DistoADO.GetInstant().Update(reqVO.distoID, pstos.id.Value, pstos.qty, pstos.baseQty, EntityStatus.DONE, BuVO);
                }
                else
                {
                    ADO.StorageObjectADO.GetInstant().PutV2(updSto, this.BuVO); //ของเดิม เหลือ 300
                    ADO.DistoADO.GetInstant().Update(reqVO.distoID, updSto.id.Value, updSto.qty, updSto.baseQty, EntityStatus.INACTIVE, BuVO);

                  
                    var auditSto = new StorageObjectCriteria();
                    auditSto = pstos.Clone();
                    auditSto.id = null;
                    auditSto.qty = reqVO.auditQty;  //audit 200
                    var qtyConvertaudit = StaticValue.ConvertToNewUnitBySKU(pstos.skuID.Value, reqVO.auditQty, pstos.unitID, pstos.baseUnitID);
                    auditSto.baseQty = qtyConvertaudit.newQty;

                    auditSto.AuditStatus = reqVO.auditStatus;
                    auditSto.eventStatus = StorageObjectEventStatus.AUDITED;
                    var newauditSto = ADO.StorageObjectADO.GetInstant().PutV2(auditSto, this.BuVO);

                    var newDisto = disto.Clone();
                    newDisto.ID = null;
                    newDisto.Des_StorageObject_ID = newauditSto;
                    newDisto.Quantity = auditSto.qty;
                    var distoqtyConvert = StaticValue.ConvertToNewUnitBySKU(pstos.skuID.Value, newDisto.Quantity.Value, pstos.unitID, pstos.baseUnitID);
                    newDisto.BaseQuantity = distoqtyConvert.newQty;
                    newDisto.Status = EntityStatus.DONE;
                    ADO.DistoADO.GetInstant().Insert(newDisto, BuVO);
                }
            }

           

            GetSTOAudit.TRes res = new GetSTOAudit.TRes();
            res = new GetSTOAudit().Execute(this.Logger, this.BuVO, new GetSTOAudit.TReq() { bstoID = reqVO.bstoID });
            if (res == null)
            {//disto ปิดหมด 

                res = new GetSTOAudit.TRes()
                {
                    docIDs = new List<long>() { reqVO.pi_docID }
                };
            }
            else
            {
                res.docIDs = new List<long>() { reqVO.pi_docID };
            }
            return res;
        }

    }
}
