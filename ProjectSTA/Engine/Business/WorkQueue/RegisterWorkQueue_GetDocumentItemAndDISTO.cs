﻿using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.Common;
using AWMSEngine.Engine;
using AWMSEngine.Engine.V2.Business.Issued;
using AWMSEngine.Engine.V2.Business.Received;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectSTA.Engine.Business.WorkQueue
{
    public class RegisterWorkQueue_GetDocumentItemAndDISTO : IProjectEngine<
        RegisterWorkQueue.TReqDocumentItemAndDISTO,
        List<amt_DocumentItem>
        >
    {
        public List<amt_DocumentItem> ExecuteEngine(AMWLogger logger, VOCriteria buVO, RegisterWorkQueue.TReqDocumentItemAndDISTO data)
        {
            var reqVO = data.reqVO;
            var sto = data.sto;
            List<amt_DocumentItem> docItems = new List<amt_DocumentItem>();
            //รับสินค้าใหม่เข้าคลัง, รับเข้าpallet เปล่า, สร้างเอกสารเบิกpallet เปล่า, 
            if (sto.eventStatus == StorageObjectEventStatus.NEW)
            {
                docItems = this.ProcessReceiving(sto, reqVO, logger, buVO);

                if (docItems.Count() == 0)
                    throw new AMWException(logger, AMWExceptionCode.V2001, "Good Received Document Not Found");
            }
            //return picking
            else if (sto.eventStatus == StorageObjectEventStatus.RECEIVED)
            {
                
            }
            else
            {
                throw new AMWException(logger, AMWExceptionCode.V2002, "Can't receive Base Code '" + reqVO.baseCode + "' into ASRS because it has Event Status '" + sto.eventStatus + "'");
            }

            return docItems;
        }

        //BEGIN*******************ProcessReceiving***********************

        private List<amt_DocumentItem> ProcessReceiving(StorageObjectCriteria mapsto, RegisterWorkQueue.TReq reqVO, AMWLogger logger, VOCriteria buVO)
        {
            var StaticValue = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant();
            List<amt_DocumentItem> docItems = new List<amt_DocumentItem>();
            var mapstoTree = mapsto.ToTreeList();
            var packs = mapstoTree.Where(x => x.type == StorageObjectType.PACK && x.eventStatus == StorageObjectEventStatus.NEW).ToList();

            foreach (var packH in packs)
            {
                MovementType FG_Movement = MovementType.FG_TRANSFER;
                
                //var skuPack = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<ams_SKUMaster>((long)packH.skuID, buVO);
                var empPallet = StaticValue.SKUMasterEmptyPallets.Find(x => x.ID == (long)packH.skuID);
                if (empPallet == null)
                {
                    //ไม่เป็นพาเลทเปล่า
                    if (packH.options != null && packH.options.Length > 0)
                    {
                        if (ObjectUtil.QryStrGetValue(packH.options, "MVT").Equals(MovementType.FG_RETURNCUSTOMER))
                        {
                            FG_Movement = MovementType.FG_RETURNCUSTOMER;
                        }
                    }
                }
                else
                {
                    FG_Movement = MovementType.EMP_TRANSFER;
                }
                amt_DocumentItem docItem = new amt_DocumentItem();
                if (reqVO.ioType == IOType.INPUT)
                {
                    //หา  List<amt_DocumentItem> ที่มีสินค้าตรงกัน และเช็ค Options(CartonNo) ถ้าไม่ตรงให้เพิ่ม DocItem ใหม่
                    docItem = AWMSEngine.ADO.DocumentADO.GetInstant()
                            .ListItemCanMapV2(DocumentTypeID.GOODS_RECEIVED, packH.mstID, packH.baseQty, null, null, null, null, packH.unitID, packH.baseUnitID, packH.orderNo, null, null, null, buVO)
                            //.ListItemCanMapV2(DocumentTypeID.GOODS_RECEIVED, packH.mstID, packH.baseQty, souBranchID, _warehouseASRS.ID, null, null, packH.unitID, packH.baseUnitID, packH.orderNo, null, null, packH.options, this.BuVO)
                            .FirstOrDefault(x => x.EventStatus == DocumentEventStatus.WORKING || x.EventStatus == DocumentEventStatus.NEW);

                    //pack Info พบ Docitem ที่สามารถ Mapping ได้
                    if (docItem != null)
                    {
                        //check ว่ามีสินค้านี้มีการผูกกับ DiSTO เเล้วหรือยัง ถ้ามีคือการส่งค่ามาซ้ำ จะเเสดง Exception
                        var docItemsSto = AWMSEngine.ADO.DocumentADO.GetInstant()
                           .ListStoInDocs(docItem.Document_ID, buVO)
                           .FirstOrDefault(x => x.Status == EntityStatus.INACTIVE && x.Sou_StorageObject_ID == packH.id);
                        if (docItemsSto != null)
                            throw new AMWException(logger, AMWExceptionCode.V1001, "Document Item StorageObject had SKU Code '" + packH.code + "', Order No.'" + packH.orderNo + "' on Pallet Code '" + reqVO.baseCode + "' already");

                        var docItemStos = AWMSEngine.ADO.DocumentADO.GetInstant().InsertMappingSTO(ConverterModel.ToDocumentItemStorageObject(packH, null, null, docItem.ID), buVO);
                        docItem.DocItemStos = new List<amt_DocumentItemStorageObject>() { docItemStos };
                        docItems.Add(docItem);
                    }
                    else
                    {
                         
                            var doc = AWMSEngine.ADO.DocumentADO.GetInstant().ListDocs(DocumentTypeID.GOODS_RECEIVED, null, null, null, FG_Movement, buVO)
                                    //var doc = AWMSEngine.ADO.DocumentADO.GetInstant().ListDocs(DocumentTypeID.GOODS_RECEIVED, souBranchID, _warehouseASRS.ID, null, MovementType.RECEIVE_PRODUCTION, this.BuVO)
                                    .FirstOrDefault(x => x.EventStatus == DocumentEventStatus.WORKING || x.EventStatus == DocumentEventStatus.NEW); //_areaASRS.ID
                                                                                                                                                    //Pack Info ไม่พบ Document Item ใดๆที่ตรงกับในระบบ
                            if (doc == null)
                            {
                                doc = new CreateGRDocument().Execute(logger, buVO,
                                           new CreateGRDocument.TReq()
                                           {
                                               refID = null,
                                               ref1 = null,
                                               ref2 = null,
                                               souBranchID = null,
                                               souWarehouseID = null, //
                                               souAreaMasterID = null,  //
                                               desBranchID = StaticValue.Warehouses.First(x => x.ID == mapsto.warehouseID).Branch_ID,
                                               desWarehouseID = mapsto.warehouseID,
                                               desAreaMasterID = null,
                                               movementTypeID = FG_Movement,
                                               lot = null,
                                               batch = null,
                                               documentDate = DateTime.Now,
                                               actionTime = DateTime.Now,
                                               eventStatus = DocumentEventStatus.NEW,
                                               receiveItems = new List<CreateGRDocument.TReq.ReceiveItem>() {
                                                        new CreateGRDocument.TReq.ReceiveItem
                                                        {
                                                            packCode = packH.code,//
                                                            quantity = null,
                                                            unitType = packH.unitCode,//
                                                            batch = null,
                                                            lot = null,
                                                            orderNo = FG_Movement == MovementType.EMP_TRANSFER ? null : packH.orderNo, //empty pallet = null
                                                            ref2 = null,
                                                            //options = packH.options,
                                                            eventStatus = DocumentEventStatus.NEW,
                                                            docItemStos = new List<amt_DocumentItemStorageObject>() { ConverterModel.ToDocumentItemStorageObject(packH) }

                                                        }}
                                           });

                                docItems.AddRange(doc.DocumentItems);
                            }

                            //Pack Info พบ Document แต่ไม่พบ DocumentItem
                            else
                            {
                                var packConvert = StaticValue.ConvertToBaseUnitByPack(packH.mstID.Value, 1, packH.unitID);
                                docItem = new amt_DocumentItem()
                                {
                                    Document_ID = doc.ID.Value,
                                    Code = packH.code,
                                    PackMaster_ID = packH.mstID,
                                    Quantity = null,
                                    UnitType_ID = packH.unitID,
                                    BaseQuantity = null,
                                    BaseUnitType_ID = packH.baseUnitID,
                                    Batch = null,
                                    Lot = null,
                                    OrderNo = packH.orderNo,
                                    //Options = packH.options,
                                    ProductionDate = packH.productDate,
                                    SKUMaster_ID = packConvert.skuMaster_ID,
                                    EventStatus = DocumentEventStatus.NEW,
                                    Ref2 = null,
                                    DocItemStos = new List<amt_DocumentItemStorageObject>() { ConverterModel.ToDocumentItemStorageObject(packH) }
                                };
                                var newdocItem = AWMSEngine.ADO.DocumentADO.GetInstant().CreateItem(docItem, buVO);
                                docItems.Add(newdocItem);
                            }
                        
                    }
                }
                else
                {
                    //สร้างเอกสาร GI เบิกพาเลทเปล่า
                    if (FG_Movement == MovementType.EMP_TRANSFER)
                    {
                        var souBranchID = StaticValue.Warehouses.First(x => x.ID == mapsto.warehouseID).Branch_ID.Value;
                        var souWarehouseID = StaticValue.AreaMasters.First(x => x.ID == packH.areaID).Warehouse_ID.Value;
                        var desBranchID = StaticValue.GetBranch(null, null, null, null, reqVO.desWarehouseCode, reqVO.desAreaCode).ID.Value;
                        var desWarehouseID = StaticValue.GetWarehouse(null, null, reqVO.desWarehouseCode, null).ID.Value;
                        var desAreaMasterID = StaticValue.GetAreaMaster(null, reqVO.desAreaCode).ID.Value;

                        docItem = AWMSEngine.ADO.DocumentADO.GetInstant()
                            .ListItemCanMapV2(DocumentTypeID.GOODS_ISSUED, packH.mstID, packH.baseQty, souBranchID, souWarehouseID, desBranchID, desWarehouseID, packH.unitID, packH.baseUnitID, null, null, null, null, buVO)
                            .FirstOrDefault(x => x.EventStatus == DocumentEventStatus.WORKING || x.EventStatus == DocumentEventStatus.NEW);

                        //pack Info พบ Docitem ที่สามารถ Mapping ได้
                        if (docItem != null)
                        {
                            //check ว่ามีสินค้านี้มีการผูกกับ DiSTO เเล้วหรือยัง ถ้ามีคือการส่งค่ามาซ้ำ จะเเสดง Exception
                            var docItemsSto = AWMSEngine.ADO.DocumentADO.GetInstant()
                               .ListStoInDocs(docItem.Document_ID, buVO)
                               .FirstOrDefault(x => x.Status == EntityStatus.INACTIVE && x.Sou_StorageObject_ID == packH.id);
                            if (docItemsSto != null)
                                throw new AMWException(logger, AMWExceptionCode.V1001, "This pack had matched with GI document, already");

                            var docItemStos = AWMSEngine.ADO.DocumentADO.GetInstant().InsertMappingSTO(ConverterModel.ToDocumentItemStorageObject(packH, null, null, docItem.ID), buVO);
                            docItem.DocItemStos = new List<amt_DocumentItemStorageObject>() { docItemStos };
                            docItems.Add(docItem);
                        }
                        else
                        {
                            
                            var doc = AWMSEngine.ADO.DocumentADO.GetInstant().ListDocs(DocumentTypeID.GOODS_ISSUED, souBranchID, souWarehouseID, packH.areaID, FG_Movement, buVO)
                                .FirstOrDefault(x => x.EventStatus == DocumentEventStatus.WORKING || x.EventStatus == DocumentEventStatus.NEW);
                            if (doc == null)
                            {
                                doc = new CreateGIDocument().Execute(logger, buVO,
                                        new CreateGIDocument.TReq
                                        {
                                            refID = null,
                                            ref1 = null,
                                            ref2 = null,
                                            souBranchID = souBranchID,
                                            souWarehouseID = souWarehouseID,
                                            souAreaMasterID = packH.areaID,
                                            desBranchID = desBranchID,
                                            desWarehouseID = desWarehouseID,
                                            desAreaMasterID = desAreaMasterID,
                                            movementTypeID = FG_Movement,
                                            lot = null,
                                            batch = null,
                                            documentDate = DateTime.Now,
                                            actionTime = DateTime.Now,
                                            eventStatus = DocumentEventStatus.NEW,
                                            issueItems = new List<CreateGIDocument.TReq.IssueItem>() {
                                                new CreateGIDocument.TReq.IssueItem
                                                {
                                                    packCode = packH.code,
                                                    quantity = null,
                                                    unitType = packH.unitCode,
                                                    batch = null,
                                                    lot = null,
                                                    orderNo = null,
                                                    ref2 = null,
                                                    options = null,
                                                    eventStatus = DocumentEventStatus.NEW,
                                                    docItemStos = new List<amt_DocumentItemStorageObject>() { ConverterModel.ToDocumentItemStorageObject(packH) }

                                                }}

                                        });

                                docItems.AddRange(doc.DocumentItems);
                            }
                            else
                            {
                                var packConvert = StaticValue.ConvertToBaseUnitByPack(packH.mstID.Value, 1, packH.unitID);
                                docItem = new amt_DocumentItem()
                                {
                                    Document_ID = doc.ID.Value,
                                    Code = packH.code,
                                    PackMaster_ID = packH.mstID,
                                    Quantity = null,
                                    UnitType_ID = packH.unitID,
                                    BaseQuantity = null,
                                    BaseUnitType_ID = packH.baseUnitID,
                                    Batch = null,
                                    Lot = null,
                                    OrderNo = null,
                                    //Options = packH.options,
                                    ProductionDate = packH.productDate,
                                    SKUMaster_ID = packConvert.skuMaster_ID,
                                    EventStatus = DocumentEventStatus.NEW,
                                    Ref2 = null,
                                    DocItemStos = new List<amt_DocumentItemStorageObject>() { ConverterModel.ToDocumentItemStorageObject(packH) }
                                };
                                var newdocItem = AWMSEngine.ADO.DocumentADO.GetInstant().CreateItem(docItem, buVO);
                                docItems.Add(newdocItem);
                            }
                        }
                    }
                    else
                    {
                        throw new AMWException(logger, AMWExceptionCode.V1001, "This SKU Code '" + packH.code + "' isn't Empty Pallet.");
                    }

                }
            }

            return docItems;
        }
    }
}
