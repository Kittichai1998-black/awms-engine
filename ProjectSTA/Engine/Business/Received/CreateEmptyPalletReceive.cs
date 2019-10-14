using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Exception;
using AWMSEngine.Common;
using AWMSEngine.Engine;
using AWMSEngine.Engine.V2.Business;
using AWMSEngine.Engine.V2.Business.Received;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Request;
using AWMSModel.Entity;

namespace ProjectSTA.Engine.Business.Received
{
    public class EmptyPalletReceive : BaseEngine<EmptyPalletReceive.TReq, amt_WorkQueue>
    {
        public class TReq
        {
            public string palletCode;
            public string areaCode;
            public string areaLocationCode;
            public DateTime actionTime;
        }

        protected override amt_WorkQueue ExecuteEngine(TReq reqVO)
        {
            var AreaMasterModel = this.StaticValue.GetAreaMaster(null, reqVO.areaCode);
            var mapSto = MapSto(reqVO, AreaMasterModel);
            if(mapSto == null)
                throw new AMWException(this.Logger, AMWExceptionCode.I0001, "Failed to Create Storage");

            var docItems = CreateDocItems(reqVO, mapSto, AreaMasterModel);
            if (docItems == null)
                throw new AMWException(this.Logger, AMWExceptionCode.I0001, "Failed to Create Document");

            var workQueue = this.ProcessRegisterWorkQueue(docItems, mapSto, reqVO, AreaMasterModel);
            return null;
        }

        private amt_Document CreateDoc(TReq reqVO, ams_AreaMaster AreaMasterModel, StorageObjectCriteria mapSto)
        {
            var branchID = StaticValue.Warehouses.First(x => x.ID == AreaMasterModel.Warehouse_ID).Branch_ID;
            var warehouseID = AreaMasterModel.Warehouse_ID;
            var doc = new CreateGRDocument().Execute(this.Logger, this.BuVO,
                new CreateGRDocument.TReq()
                {
                    refID = null,
                    ref1 = null,
                    ref2 = null,
                    souBranchID = branchID,
                    souWarehouseID = warehouseID,
                    souAreaMasterID = null,
                    desBranchID = branchID,
                    desWarehouseID = warehouseID,
                    desAreaMasterID = null,
                    orderNo = null,
                    lot = null,
                    batch = null,
                    documentDate = DateTime.Now,
                    actionTime = DateTime.Now,
                    eventStatus = DocumentEventStatus.WORKING,
                    receiveItems = new List<CreateGRDocument.TReq.ReceiveItem>() {
                        new CreateGRDocument.TReq.ReceiveItem
                        {
                            skuCode = StaticValue.SKUMasterEmptyPallets.First().Code,
                            quantity = null,
                            unitType = "PL",
                            batch = null,
                            lot = null,
                            orderNo = null,
                            ref2 = null,
                            eventStatus = DocumentEventStatus.WORKING,
                            docItemStos = new List<amt_DocumentItemStorageObject>() { ConverterModel.ToDocumentItemStorageObject(mapSto) }
                        }}
                });
            return doc;
        }

        private List<amt_DocumentItem> CreateDocItems(TReq reqVO, StorageObjectCriteria stoCri, ams_AreaMaster AreaMasterModel)
        {
            List<amt_DocumentItem> docItems = new List<amt_DocumentItem>();
            var branchID = StaticValue.Warehouses.First(x => x.ID == AreaMasterModel.Warehouse_ID).Branch_ID;
            var warehouseID = AreaMasterModel.Warehouse_ID;
            foreach (var mapSto in stoCri.mapstos)
            {
                var docItem = AWMSEngine.ADO.DocumentADO.GetInstant()
                        .ListItemCanMapV2(DocumentTypeID.GOODS_RECEIVED, mapSto.mstID, mapSto.baseQty, branchID, warehouseID, branchID, warehouseID, mapSto.unitID, mapSto.baseUnitID, null, mapSto.batch, null, this.BuVO)
                        .FirstOrDefault(x => x.EventStatus == DocumentEventStatus.WORKING || x.EventStatus == DocumentEventStatus.NEW);
                if (docItem != null)
                {
                    AWMSEngine.ADO.DocumentADO.GetInstant().InsertMappingSTO(ConverterModel.ToDocumentItemStorageObject(mapSto, null, null, docItem.ID), this.BuVO);

                    var doc = AWMSEngine.ADO.DocumentADO.GetInstant().Get(docItem.Document_ID, this.BuVO);
                    if (doc.EventStatus == DocumentEventStatus.NEW)
                    {
                        AWMSEngine.ADO.DocumentADO.GetInstant().UpdateStatusToChild(doc.ID.Value, DocumentEventStatus.NEW, null, DocumentEventStatus.WORKING, this.BuVO);
                        if (doc.ParentDocument_ID.HasValue)
                            AWMSEngine.ADO.DocumentADO.GetInstant().UpdateStatusToChild(doc.ParentDocument_ID.Value, DocumentEventStatus.NEW, null, DocumentEventStatus.WORKING, this.BuVO);
                    }
                }
                else
                {
                    var doc = AWMSEngine.ADO.DocumentADO.GetInstant().List(DocumentTypeID.GOODS_RECEIVED, warehouseID, null, null, null, this.BuVO)
                       .FirstOrDefault(x => x.EventStatus == DocumentEventStatus.WORKING || x.EventStatus == DocumentEventStatus.NEW);
                    if (doc == null)
                    {
                        doc = this.CreateDoc(reqVO, AreaMasterModel, mapSto);
                        if (doc == null)
                            throw new AMWException(this.Logger, AMWExceptionCode.I0001, "Failed to Create Document");
                        docItems.AddRange(doc.DocumentItems);
                    }
                    else
                    {
                        var packConvert = this.StaticValue.ConvertToBaseUnitByPack(mapSto.mstID.Value, 1, mapSto.unitID);
                        docItem = new amt_DocumentItem()
                        {
                            Document_ID = doc.ID.Value,
                            Code = mapSto.code,
                            PackMaster_ID = mapSto.mstID,
                            Quantity = null,
                            UnitType_ID = mapSto.unitID,
                            BaseQuantity = null,
                            BaseUnitType_ID = mapSto.baseUnitID,
                            Batch = mapSto.batch,
                            Lot = mapSto.lot,
                            OrderNo = mapSto.orderNo,
                            ProductionDate = mapSto.productDate,
                            SKUMaster_ID = packConvert.skuMaster_ID,
                            EventStatus = DocumentEventStatus.WORKING,
                            Ref2 = null,

                            DocItemStos = new List<amt_DocumentItemStorageObject>() { ConverterModel.ToDocumentItemStorageObject(mapSto) }
                        };
                        AWMSEngine.ADO.DocumentADO.GetInstant().CreateItem(docItem, this.BuVO);
                        docItems.Add(docItem);
                    }
                }
            }
            return docItems;
        }

        private StorageObjectCriteria MapSto(TReq reqVO, ams_AreaMaster AreaMasterModel)
        {
            var baseSto = new ScanMapStoNoDoc.TReq()
            {
                rootID = null,
                scanCode = reqVO.palletCode,
                orderNo = null,
                batch = null,
                lot = null,
                amount = 1,
                unitCode = null,
                productDate = null,
                warehouseID = this.StaticValue.AreaMasters.Find(ar => ar.ID == AreaMasterModel.ID).Warehouse_ID,
                areaID = AreaMasterModel.ID,
                options = null,
                isRoot = true,
                mode = VirtualMapSTOModeType.REGISTER,
                action = VirtualMapSTOActionType.ADD
            };

            var mapBaseSto = new ScanMapStoNoDoc().Execute(this.Logger, this.BuVO, baseSto); 
            var mapPackSto = new ScanMapStoNoDoc.TReq()
            {
                rootID = mapBaseSto.id,
                scanCode = StaticValue.SKUMasterEmptyPallets.First().Code,
                orderNo = null,
                batch = null,
                lot = null,
                amount = 1,
                unitCode = "PL",
                productDate = null,
                warehouseID = this.StaticValue.AreaMasters.Find(ar => ar.ID == AreaMasterModel.ID).Warehouse_ID,
                areaID = AreaMasterModel.ID,
                options = null,
                isRoot = false,
                mode = VirtualMapSTOModeType.REGISTER,
                action = VirtualMapSTOActionType.ADD
            };
            var mapSto = new ScanMapStoNoDoc().Execute(this.Logger, this.BuVO, mapPackSto); ;
            var sto = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(mapBaseSto.id.Value, StorageObjectType.BASE, true, true, this.BuVO);
            return sto;
        }

        private SPworkQueue ProcessRegisterWorkQueue(
            List<amt_DocumentItem> docItems, StorageObjectCriteria mapsto, TReq reqVO, ams_AreaMaster AreaMasterModel)
        {
            var lm = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>(
                new KeyValuePair<string, object>[] {
                    new KeyValuePair<string,object>("Code",reqVO.areaLocationCode),
                    new KeyValuePair<string,object>("AreaMaster_ID",AreaMasterModel.ID),
                    new KeyValuePair<string,object>("Status", EntityStatus.ACTIVE)
                }, this.BuVO).FirstOrDefault();
            var desAreas = AWMSEngine.ADO.AreaADO.GetInstant().ListDestinationArea(IOType.INPUT, mapsto.areaID.Value, null, this.BuVO);
            var desAreaDefault = desAreas.OrderByDescending(x => x.DefaultFlag).FirstOrDefault();
            SPworkQueue workQ = new SPworkQueue()
            {
                ID = null,
                IOType = IOType.INPUT,
                ActualTime = reqVO.actionTime,
                Parent_WorkQueue_ID = null,
                Priority = 1,
                TargetStartTime = null,

                StorageObject_ID = mapsto.id,
                StorageObject_Code = mapsto.code,

                Warehouse_ID = this.StaticValue.Warehouses.FirstOrDefault(x => x.Name == "ASRS").ID.Value,
                AreaMaster_ID = this.StaticValue.GetAreaMaster(null, "SA").ID.Value,
                AreaLocationMaster_ID = null,

                Sou_Warehouse_ID =  AreaMasterModel.Warehouse_ID.Value,
                Sou_AreaMaster_ID = AreaMasterModel.ID.Value,
                Sou_AreaLocationMaster_ID = lm.ID,

                Des_Warehouse_ID = this.StaticValue.AreaMasters.First(x => x.ID == desAreaDefault.Des_AreaMaster_ID).Warehouse_ID.Value,
                Des_AreaMaster_ID = desAreaDefault.Des_AreaMaster_ID.Value,
                Des_AreaLocationMaster_ID = desAreaDefault.Des_AreaLocationMaster_ID,

                EventStatus = WorkQueueEventStatus.WORKING,
                Status = EntityStatus.ACTIVE,
                StartTime = reqVO.actionTime,

                DocumentItemWorkQueues = AWMSEngine.Common.ConverterModel.ToDocumentItemWorkQueue(docItems, mapsto)
            };
            workQ = AWMSEngine.ADO.WorkQueueADO.GetInstant().Create_LossVersion(workQ, this.BuVO);
            return workQ;
        }
    }
}