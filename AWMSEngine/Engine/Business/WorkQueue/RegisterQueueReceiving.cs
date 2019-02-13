using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.Common;
using AWMSEngine.Engine.Business.Received;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Request;
using AWMSModel.Criteria.SP.Response;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.WorkQueue
{
    public class RegisterQueueReceiving : BaseQueue<RegisterQueueReceiving.TReq, WorkQueueCriteria>
    {
        public class TReq //ข้อมูล Request จาก WCS
        {
            public string baseCode;//รหัสพาเลท
            public decimal? weight;//น้ำหนัก Kg.
            public decimal? width;//กว้าง M.
            public decimal? length;//ยาว M.
            public decimal? height;//สูง M.
            public string warehouseCode;//รหัสคลังสินค้า
            public string areaCode;//รหัสโซน
            public string locationCode;//รหัสเกต
            public DateTime actualTime;
            public List<PalletDataCriteria> mappingPallets;

        }
        private ams_Warehouse _warehouseASRS;
        private ams_AreaMaster _areaASRS;
        private ams_AreaLocationMaster _locationASRS;

        protected override WorkQueueCriteria ExecuteEngine(TReq reqVO)
        {
            //Init Data from ASRS
            this.InitDataASRS(reqVO);

            //Get or Mapping Pallet
            var mapsto = this.MappingPallet(reqVO);
            if (mapsto == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Base Code '" + reqVO.baseCode + "'");

            if (mapsto.code != reqVO.baseCode)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Base Code '" + reqVO.baseCode + "' ไม่ถูกต้อง");

            var destinationLine = ADO.AreaADO.GetInstant().ListDestinationArea(IOType.INPUT, mapsto.areaID, this.BuVO);

            //if (!destinationLine.Any(x => x.Des_AreaMaster_ID == this._areaASRS.ID))
            //    throw new AMWException(this.Logger, AMWExceptionCode.V1001,
            //        "ไม่สามารถสร้างคิวงาน จากต้นทาง '" + this.StaticValue.AreaMasters.First(x => x.ID == mapsto.areaID).Code + "' ไปที่ปลายทาง '" + this._areaASRS.Code + "' ได้");

            List<amt_DocumentItem> docItems = null;
            //รับสินค้าใหม่เข้าคลัง
            if (mapsto.eventStatus == StorageObjectEventStatus.IDLE)
            {
                docItems = this.ProcessReceiving(mapsto, reqVO);

                if (docItems.Count() == 0)
                    throw new AMWException(this.Logger, AMWExceptionCode.V2001, "ไม่พบเอกสาร Receive");
            }
            //Move สินค้าจาก Area อื่น
            else if (mapsto.eventStatus == StorageObjectEventStatus.RECEIVED)
            {

            }
            //คืนเศษที่เหลือจากการ Picking
            else if (mapsto.eventStatus == StorageObjectEventStatus.PICKING)
            {
                List<long> packIDs = mapsto.ToTreeList().Where(x => x.type == StorageObjectType.PACK).Select(x => x.id.Value).ToList();
                docItems = ADO.DocumentADO.GetInstant().ListItemBySTO(packIDs, DocumentTypeID.GOODS_ISSUED, this.BuVO);
                if (docItems.Any(x => x.EventStatus == DocumentEventStatus.WORKING))
                    throw new AMWException(this.Logger, AMWExceptionCode.V2002, "ไม่สามารถรับ Base Code '" + reqVO.baseCode + "' เข้าคลังได้ เนื่องจากงาน Picking ยังไม่เรียบร้อย");
                ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(mapsto.id.Value, null, EntityStatus.ACTIVE, StorageObjectEventStatus.RECEIVING, this.BuVO);
                if (docItems.Count() == 0)
                    throw new AMWException(this.Logger, AMWExceptionCode.V2001, "ไม่พบเอกสาร Issue");
            }
            //คืนเศษที่เหลือจากการ Counting
            else if (mapsto.eventStatus == StorageObjectEventStatus.AUDITING || mapsto.eventStatus == StorageObjectEventStatus.AUDITED)
            {
                List<long> packIDs = mapsto.ToTreeList().Where(x => x.type == StorageObjectType.PACK).Select(x => x.id.Value).ToList();
                docItems = ADO.DocumentADO.GetInstant().ListItemBySTO(packIDs, DocumentTypeID.AUDIT, this.BuVO);
                //ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(mapsto.id.Value, null, EntityStatus.ACTIVE, StorageObjectEventStatus.RECEIVING, this.BuVO);
                if (docItems.Count() == 0)
                    throw new AMWException(this.Logger, AMWExceptionCode.V2001, "ไม่พบเอกสาร Audit");

            }
            else
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V2002, "ไม่สามารถรับ Base Code '" + reqVO.baseCode + "' เข้าคลังได้ เนื่องจากมีสถานะ '" + mapsto.eventStatus + "'");
            }

            var workQ = this.ProcessRegisterWorkQueue(docItems, mapsto, reqVO);

            this.ValidateObjectSizeLimit(mapsto);

            var res = this.GenerateResponse(mapsto, workQ);
            return res;
        }


        private void InitDataASRS(TReq reqVO)
        {
            this._warehouseASRS = this.StaticValue.Warehouses.FirstOrDefault(x => x.Code == reqVO.warehouseCode);
            if (_warehouseASRS == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Warehouse Code '" + reqVO.warehouseCode + "'");
            this._areaASRS = this.StaticValue.AreaMasters.FirstOrDefault(x => x.Code == reqVO.areaCode && x.Warehouse_ID == _warehouseASRS.ID);
            if (_areaASRS == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Area Code '" + reqVO.areaCode + "'");
            this._locationASRS = ADO.DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>(
                new KeyValuePair<string, object>[] {
                    new KeyValuePair<string,object>("Code",reqVO.locationCode),
                    new KeyValuePair<string,object>("AreaMaster_ID",_areaASRS.ID.Value),
                    new KeyValuePair<string,object>("Status", EntityStatus.ACTIVE)
                }, this.BuVO).FirstOrDefault();
            if (_locationASRS == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Location Code '" + reqVO.locationCode + "'");

        }

        private StorageObjectCriteria MappingPallet(TReq reqVO)
        {
            var mapsto = ADO.StorageObjectADO.GetInstant().Get(reqVO.baseCode,
                null, null, false, true, this.BuVO);

            if (mapsto == null || mapsto.eventStatus == StorageObjectEventStatus.IDLE)
            {
                if (mapsto != null && mapsto.eventStatus == StorageObjectEventStatus.IDLE)
                    ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(mapsto.id.Value, null, null, StorageObjectEventStatus.REMOVED, this.BuVO);

                var palletList = new List<PalletDataCriteria>();
                palletList.Add(new PalletDataCriteria()
                {
                    source = "Sou_Warehouse_Code=" + reqVO.mappingPallets[0].source,
                    code = reqVO.baseCode,
                    qty = "1",
                    unit = null,
                    orderNo = null,
                    batch = null,
                    lot = null,
                    warehouseCode = reqVO.warehouseCode,
                    areaCode = reqVO.areaCode,
                });

                foreach (var row in reqVO.mappingPallets)
                {
                    palletList.Add(new PalletDataCriteria()
                    {
                        source = "Sou_Warehouse_Code=" + row.source,
                        code = row.code,
                        qty = row.qty,
                        unit = row.unit,
                        orderNo = row.orderNo,
                        batch = row.batch,
                        lot = row.lot,
                        warehouseCode = reqVO.warehouseCode,
                        areaCode = reqVO.areaCode,
                        //movingType = row.movingType
                    });
                }

                var reqMapping = new WCSMappingPallet.TReq()
                {
                    actualWeiKG = reqVO.weight,
                    palletData = palletList
                };

                mapsto = new WCSMappingPallet().Execute(this.Logger, this.BuVO, reqMapping);
            }
            //mapsto.weiKG = reqVO.weight;
            mapsto.lengthM = reqVO.length;
            mapsto.heightM = reqVO.height;
            mapsto.widthM = reqVO.width;
            mapsto.warehouseID = _warehouseASRS.ID.Value;
            mapsto.areaID = _areaASRS.ID.Value;
            mapsto.parentID = _locationASRS.ID.Value;
            mapsto.parentType = StorageObjectType.LOCATION;

            this.SetWeiChildAndUpdateInfoToChild(mapsto, reqVO.weight ?? 0);

            ADO.StorageObjectADO.GetInstant()
                .UpdateStatusToChild(mapsto.id.Value, StorageObjectEventStatus.IDLE, null, StorageObjectEventStatus.RECEIVING, this.BuVO);

            return mapsto;
        }

        public void SetWeiChildAndUpdateInfoToChild(StorageObjectCriteria mapsto, decimal totalWeiKG)
        {
            var stoTreeList = mapsto.ToTreeList();
            var packMasters = ADO.DataADO.GetInstant().SelectBy<ams_PackMaster>(
                new SQLConditionCriteria(
                    "ID",
                    string.Join(',', stoTreeList.Where(x => x.type == StorageObjectType.PACK).Select(x => x.mstID.Value).Distinct().ToArray()),
                    SQLOperatorType.IN),
                this.BuVO);
            var baseMasters = ADO.DataADO.GetInstant().SelectBy<ams_BaseMaster>(
                new SQLConditionCriteria(
                    "ID",
                    string.Join(',', stoTreeList.Where(x => x.type == StorageObjectType.BASE).Select(x => x.mstID.Value).Distinct().ToArray()),
                    SQLOperatorType.IN),
                this.BuVO);
            //*****SET WEI CODING

            mapsto.weiKG = totalWeiKG;
            var innerTotalWeiKG = totalWeiKG - (baseMasters.First(x => x.ID == mapsto.mstID).WeightKG.Value);

            List<decimal> precenFromTotalWeis = new List<decimal>();
            decimal totalWeiStd = packMasters
                .Sum(x =>
                    (x.WeightKG ?? 0) *
                    mapsto.mapstos.Where(y => y.type == StorageObjectType.PACK && y.mstID == x.ID).Sum(y => y.qty));

            mapsto.mapstos.FindAll(x => x.type == StorageObjectType.PACK).ForEach(sto =>
            {
                decimal percentWeiStd =
                (
                    packMasters.First(x => x.ID == sto.mstID).WeightKG.Value *
                    sto.qty
                ) / totalWeiStd;
                sto.weiKG = percentWeiStd * innerTotalWeiKG;
            });

            long areaID = mapsto.areaID;
            stoTreeList.ForEach(x =>
            {
                x.areaID = areaID;
                ADO.StorageObjectADO.GetInstant().PutV2(x, BuVO);
            });
        }



        //BEGIN*******************ProcessReceiving***********************
        private List<amt_DocumentItem> ProcessReceiving(StorageObjectCriteria mapsto, TReq reqVO)
        {
            List<amt_DocumentItem> docItems = new List<amt_DocumentItem>();
            var mapstoTree = mapsto.ToTreeList();
            foreach (var souWarehouse in mapstoTree
                                                    .Where(x => x.type == StorageObjectType.PACK && x.eventStatus == StorageObjectEventStatus.IDLE)
                                                    .GroupBy(x => x.options)
                                                    .Select(x => new { code = ObjectUtil.QryStrGetValue(x.Key, "Sou_Warehouse_Code"), stoIDs = x.Select(y => y.id.Value) }))
            {
                var wm = this.StaticValue.Warehouses.FirstOrDefault(x => x.Code == souWarehouse.code);
                var bh = this.StaticValue.Branchs.FirstOrDefault(x => x.ID == wm.Branch_ID);

                var dis = this.ProcessReceiving_CreateDocumentItems(
                                reqVO,
                                wm.ID.Value,
                                mapstoTree.Where(x => souWarehouse.stoIDs.Any(y => y == x.id.Value)).ToList(),
                                bh.Code == "1100");
                docItems.AddRange(dis);
            }

            mapsto.eventStatus = StorageObjectEventStatus.RECEIVING;

            return docItems;
        }

        private List<amt_DocumentItem> ProcessReceiving_CreateDocumentItems(TReq reqVO, long souWarehouseID, List<StorageObjectCriteria> packs, bool isAutoCreate)
        {
            List<amt_DocumentItem> docItems = new List<amt_DocumentItem>();
            foreach (var packH in packs)
            {
                var docItem = ADO.DocumentADO.GetInstant()
                    .ListItemCanMapV2(DocumentTypeID.GOODS_RECEIVED, packH.mstID, packH.baseQty, souWarehouseID, null, packH.unitID, packH.baseUnitID, null, packH.batch, null, this.BuVO)
                    .FirstOrDefault(x => x.EventStatus == DocumentEventStatus.WORKING || x.EventStatus == DocumentEventStatus.IDLE);


                //pack Info พบ Docitem ที่สามารถ Mapping ได้
                if (docItem != null)
                {
                    ADO.DocumentADO.GetInstant().MappingSTO(ConverterModel.ToDocumentItemStorageObject(packH, null, null, docItem.ID), this.BuVO);

                    var doc = ADO.DocumentADO.GetInstant().Get(docItem.Document_ID, this.BuVO);
                    if (doc.EventStatus == DocumentEventStatus.IDLE)
                    {
                        ADO.DocumentADO.GetInstant().UpdateStatusToChild(doc.ID.Value, DocumentEventStatus.IDLE, null, DocumentEventStatus.WORKING, this.BuVO);
                        if (doc.ParentDocument_ID.HasValue)
                            ADO.DocumentADO.GetInstant().UpdateStatusToChild(doc.ParentDocument_ID.Value, DocumentEventStatus.IDLE, null, DocumentEventStatus.WORKING, this.BuVO);
                    }
                    docItems.Add(docItem);
                }
                else if (isAutoCreate)
                {
                    var doc = ADO.DocumentADO.GetInstant().List(DocumentTypeID.GOODS_RECEIVED, souWarehouseID, null, null, null, this.BuVO)
                        .FirstOrDefault(x => x.EventStatus == DocumentEventStatus.WORKING || x.EventStatus == DocumentEventStatus.IDLE);
                    //Pack Info ไม่พบ Document Item ใดๆที่ตรงกับในระบบ
                    if (doc == null)
                    {

                        doc = new Engine.Business.Received.CreateGRDocument().Execute(this.Logger, this.BuVO,
                            new CreateGRDocument.TReq()
                            {
                                refID = null,
                                ref1 = null,
                                ref2 = this.StaticValue.Warehouses.First(x => x.ID == souWarehouseID).Code == "5005" ? "321" : "311",//TODO FIX SAPCODE
                                souBranchID = this.StaticValue.Warehouses.First(x => x.ID == souWarehouseID).Branch_ID,
                                souWarehouseID = souWarehouseID,
                                desBranchID = this.StaticValue.Warehouses.First(x => x.ID == _warehouseASRS.ID).Branch_ID,
                                desWarehouseID = _warehouseASRS.ID,
                                desAreaMasterID = _areaASRS.ID,
                                orderNo = null,
                                lot = null,
                                batch = null,
                                documentDate = DateTime.Now,
                                actionTime = DateTime.Now,
                                eventStatus = DocumentEventStatus.WORKING,
                                receiveItems = new List<CreateGRDocument.TReq.ReceiveItem>() {
                                                    new CreateGRDocument.TReq.ReceiveItem
                                                    {
                                                        packCode = packH.code,
                                                        quantity = null,
                                                        unitType = packH.unitCode,

                                                        batch = packH.batch,
                                                        lot = packH.lot,//packH.lot,
                                                        orderNo = packH.orderNo,//packH.orderNo,


                                                        ref2 = this.StaticValue.Warehouses.First(y => y.ID == souWarehouseID).Code == "5005" ? "321" : "311",//TODO FIX SAPCODE

                                                        eventStatus = DocumentEventStatus.WORKING,
                                                        docItemStos = new List<amt_DocumentItemStorageObject>() { ConverterModel.ToDocumentItemStorageObject(packH) }

                                                    }}
                            });
                        docItems.AddRange(doc.DocumentItems);
                        //ADO.DocumentADO.GetInstant().Create(doc, this.BuVO);
                    }
                    //Pack Info พบ Document แต่ไม่พบ DocumentItem
                    else
                    {
                        var packConvert = this.StaticValue.ConvertToBaseUnitByPack(packH.mstID.Value, 1, packH.unitID);
                        docItem = new amt_DocumentItem()
                        {
                            Document_ID = doc.ID.Value,
                            Code = packH.code,
                            PackMaster_ID = packH.mstID,
                            Quantity = null,
                            UnitType_ID = packH.unitID,
                            BaseQuantity = null,
                            BaseUnitType_ID = packH.baseUnitID,
                            Batch = packH.batch,
                            Lot = packH.lot,
                            OrderNo = packH.orderNo,
                            ProductionDate = packH.productDate,
                            SKUMaster_ID = packConvert.skuMaster_ID,
                            EventStatus = DocumentEventStatus.WORKING,
                            Ref2 = this.StaticValue.Warehouses.First(y => y.ID == souWarehouseID).Code == "5005" ? "321" : "311",//TODO FIX SAPCODE

                            DocItemStos = new List<amt_DocumentItemStorageObject>() { ConverterModel.ToDocumentItemStorageObject(packH) }
                        };
                        ADO.DocumentADO.GetInstant().CreateItem(docItem, this.BuVO);
                        docItems.Add(docItem);
                    }
                }
                else
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.V2002, "ไม่สามารถรับเข้ารายการ '" + string.Join(',', packs.Select(x => x.code).ToArray()) + "' เนื่องจากไม่มีเอกสาร Goods Receive");
                }
                packH.eventStatus = StorageObjectEventStatus.RECEIVED;
            }
            return docItems;
        }
        //END*******************ProcessReceiving***********************

        //BEGIN*******************ProcessRegisterWorkQueue***********************
        private SPworkQueue ProcessRegisterWorkQueue(
            List<amt_DocumentItem> docItems, StorageObjectCriteria mapsto, TReq reqVO)
        {
            var desAreas = ADO.AreaADO.GetInstant().ListDestinationArea(IOType.INPUT, mapsto.areaID, _locationASRS.ID, this.BuVO);
            var desAreaDefault = desAreas.OrderByDescending(x => x.DefaultFlag).FirstOrDefault();
            SPworkQueue workQ = new SPworkQueue()
            {
                ID = null,
                IOType = IOType.INPUT,
                ActualTime = reqVO.actualTime,
                Parent_WorkQueue_ID = null,
                Priority = 1,
                TargetStartTime = null,

                StorageObject_ID = mapsto.id,
                StorageObject_Code = mapsto.code,

                Warehouse_ID = _warehouseASRS.ID.Value,
                AreaMaster_ID = _areaASRS.ID.Value,
                AreaLocationMaster_ID = _locationASRS.ID,

                Sou_Warehouse_ID = _warehouseASRS.ID.Value,
                Sou_AreaMaster_ID = _areaASRS.ID.Value,
                Sou_AreaLocationMaster_ID = _locationASRS.ID,

                Des_Warehouse_ID = this.StaticValue.AreaMasters.First(x => x.ID == desAreaDefault.Des_AreaMaster_ID).Warehouse_ID.Value,
                Des_AreaMaster_ID = desAreaDefault.Des_AreaMaster_ID.Value,
                Des_AreaLocationMaster_ID = desAreaDefault.Des_AreaLocationMaster_ID,

                EventStatus = WorkQueueEventStatus.WORKING,
                Status = EntityStatus.ACTIVE,
                StartTime = reqVO.actualTime,

                DocumentItemWorkQueues = Common.ConverterModel.ToDocumentItemWorkQueue(docItems, mapsto)
            };
            workQ = ADO.WorkQueueADO.GetInstant().Create(workQ, this.BuVO);
            return workQ;
        }
        //END*******************ProcessRegisterWorkQueue***********************
    }
}
