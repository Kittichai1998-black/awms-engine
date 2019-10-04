﻿using AMWUtil.Logger;
using AWMSEngine.Engine;
using AWMSEngine.Engine.V2.Business.Received;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectTMC.Engine.Business.WorkQueue
{
    public class DoneQueueWorked : IProjectEngine<List<long>, List<long>>
    {
        public List<long> ExecuteEngine(AMWLogger logger, VOCriteria buVO, List<long> reqVO)
        {
            reqVO.ForEach(x =>
            {
                var docs = AWMSEngine.ADO.DocumentADO.GetInstant().Get(x, buVO);
                if (docs != null)
                {
                    if (docs.DocumentType_ID != DocumentTypeID.AUDIT)
                    {
                        var docItems = AWMSEngine.ADO.DocumentADO.GetInstant().ListItemAndDisto(x, buVO);
                        docItems.ForEach(docItem =>
                        {
                            if (docItem.DocItemStos.TrueForAll(z => z.Status == EntityStatus.ACTIVE))
                            {
                                AWMSEngine.ADO.DocumentADO.GetInstant().UpdateItemEventStatus(docItem.ID.Value, DocumentEventStatus.WORKED, buVO);

                                var sum_disto = docItem.DocItemStos.Sum(t => t.Quantity);
                                //ถ้า STO ของที่เบิก เบิกไม่หมด จะต้องเอาของที่เหลือไปสร้างเอกสาร Picking Return
                                if (sum_disto > docItem.Quantity)
                                {   //StoQTY = 150 > จำนวนที่ขอเบิก 100 
                                    //เอา 50 ที่เหลือ ไปสร้างเอกสาร Picking Return
                                    CreateGRDocument(docItem, logger, buVO);
                                }
                            }
                        });

                        var listItem = AWMSEngine.ADO.DocumentADO.GetInstant().ListItem(x, buVO);
                        if (listItem.TrueForAll(y => y.EventStatus == DocumentEventStatus.WORKED))
                        {
                            AWMSEngine.ADO.DocumentADO.GetInstant().UpdateStatusToChild(x, DocumentEventStatus.WORKING, null, DocumentEventStatus.WORKED, buVO);
                        } 

                    }
                }

            });

            return reqVO;
        }
        private void CreateGRDocument(amt_DocumentItem docItem, AMWLogger logger, VOCriteria buVO)
        {
            var StaticValue = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant();
            var document = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<amt_Document>(docItem.Document_ID, buVO);
            var sum_disto = docItem.DocItemStos.Sum(t => t.Quantity);
            var sumBase_disto = docItem.DocItemStos.Sum(t => t.BaseQuantity);

            amt_Document doc = new amt_Document()
            {
                ID = null,
                Code = null,
                ParentDocument_ID = docItem.Document_ID,
                Lot = document.Lot,
                Batch = document.Batch,
                For_Customer_ID = null,
                Sou_Customer_ID = null,
                Sou_Supplier_ID = null,
                Sou_Branch_ID = document.Sou_Branch_ID,
                Sou_Warehouse_ID = document.Sou_Warehouse_ID,
                Sou_AreaMaster_ID = null,

                Des_Customer_ID = null,
                Des_Supplier_ID = null,
                Des_Branch_ID = document.Sou_Branch_ID,
                Des_Warehouse_ID = document.Sou_Warehouse_ID,
                Des_AreaMaster_ID = null,

                DocumentDate = DateTime.Now,
                ActionTime = DateTime.Now,
                MovementType_ID = MovementType.FG_PICK_RETURN_WM,
                RefID = document.RefID,
                Ref1 = document.Ref1,
                Ref2 = document.Ref2,

                DocumentType_ID = DocumentTypeID.GOODS_RECEIVED,
                EventStatus = DocumentEventStatus.NEW,

                Remark = document.Remark,
                Options = document.Options,
                Transport_ID = null,

                DocumentItems = new List<amt_DocumentItem>(),

            };
            doc.DocumentItems.Add(new amt_DocumentItem()
            {
                ID = null,
                Code = docItem.Code,
                SKUMaster_ID = docItem.SKUMaster_ID,
                PackMaster_ID = docItem.PackMaster_ID,

                Quantity = sum_disto - docItem.Quantity,
                UnitType_ID = docItem.UnitType_ID,
                BaseQuantity = sumBase_disto - docItem.BaseQuantity,
                BaseUnitType_ID = docItem.BaseUnitType_ID,

                OrderNo = docItem.OrderNo,
                Batch = docItem.Batch,
                Lot = docItem.Lot,

                Options = docItem.Options,
                ExpireDate = docItem.ExpireDate,
                ProductionDate = docItem.ProductionDate,
                Ref1 = docItem.Ref1,
                Ref2 = docItem.Ref2,
                RefID = docItem.RefID,

                EventStatus = DocumentEventStatus.NEW,
                DocItemStos = new List<amt_DocumentItemStorageObject>()

            });

            var docnew = AWMSEngine.ADO.DocumentADO.GetInstant().Create(doc, buVO);
            /*
            var docItems = new List<CreateGRDocument.TReq.ReceiveItem>();

            docItems.Add(new CreateGRDocument.TReq.ReceiveItem
            {
                //clone มาทั้งหมด
                packCode = docItem.Code,
                quantity = sum_disto - docItem.BaseQuantity,
                unitType = StaticValue.UnitTypes.First(x => x.ID == docItem.UnitType_ID).Code,
                batch = docItem.Batch,
                lot = docItem.Lot,
                orderNo = docItem.OrderNo,
                ref2 = docItem.Ref2,
                expireDate = docItem.ExpireDate,
                productionDate = docItem.ExpireDate,
                ref1 = docItem.Ref1,
                refID = docItem.RefID,
                options = null,
                eventStatus = DocumentEventStatus.NEW,
                docItemStos = new List<amt_DocumentItemStorageObject>() {}
            });
            var doc = new CreateGRDocument().Execute(logger, buVO,
                   new CreateGRDocument.TReq
                   {
                       parentDocumentID = docItem.Document_ID,
                       souBranchID = document.Sou_Branch_ID,
                       souWarehouseID = document.Sou_Warehouse_ID,
                       souAreaMasterID = null,
                       desBranchID = document.Sou_Branch_ID,
                       desWarehouseID = document.Sou_Warehouse_ID,
                       desAreaMasterID = null,
                       movementTypeID = MovementType.FG_PICK_RETURN_WM,
                       //lot = null,
                       //batch = null,
                       //refID = null,
                       //ref1 = null,
                       //ref2 = null,
                       
                       documentDate = DateTime.Now,
                       actionTime = DateTime.Now,
                       eventStatus = DocumentEventStatus.NEW,
                       receiveItems = docItems

                   });*/


        }
    }
}