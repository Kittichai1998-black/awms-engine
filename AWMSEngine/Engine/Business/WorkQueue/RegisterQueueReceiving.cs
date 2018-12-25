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
    public class RegisterQueueReceiving : BaseEngine<RegisterQueueReceiving.TReq, WorkQueueCriteria>
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


            List<amt_DocumentItem> docItems = null;
            //รับสินค้าใหม่เข้าคลัง
            if (mapsto.eventStatus == StorageObjectEventStatus.IDEL)
            {
                docItems = this.ProcessReceiving(mapsto, reqVO);               
            }
            //คืนเศษที่เหลือจากการ Picking
            else if (mapsto.eventStatus == StorageObjectEventStatus.PICKING)
            {
                List<long> itemList = mapsto.ToTreeList().Select(x => x.id.Value).ToList();
                var stoList = ADO.DocumentADO.GetInstant().ListStoInDocs(itemList, DocumentTypeID.PICKING, this.BuVO);
                if(stoList.Count > 0)
                    throw new AMWException(this.Logger, AMWExceptionCode.V2002, "ไม่สามารถรับ Base Code '" + reqVO.baseCode + "' เข้าคลังได้ เนื่องจากงาน Picking ยังไม่เรียบร้อย");
                //this.ValidateWarehouseMoving(mapsto, reqVO);
            }
            //คืนเศษที่เหลือจากการ Counting
            else if (mapsto.eventStatus == StorageObjectEventStatus.AUDITING || mapsto.eventStatus == StorageObjectEventStatus.AUDITED)
            {
                //this.ValidateAuditReturn(mapsto, reqVO);
            }
            else
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V2002, "ไม่สามารถรับ Base Code '" + reqVO.baseCode + "' เข้าคลังได้ เนื่องจากมีสถานะ '" + mapsto.eventStatus + "'");
            }



            var workQ = this.ProcessRegisterWorkQueue(docItems,mapsto, reqVO);

            /*docItemsInSto.GroupBy(x => new { docID = x.Document_ID }).ToList().ForEach(x =>
            {
                ADO.DocumentADO.GetInstant().UpdateEventStatus(x.Key.docID, DocumentEventStatus.WORKING, this.BuVO);
            });
            docItemsInSto.GroupBy(x => new { docItemID = x.ID }).ToList().ForEach(x =>
            {
                ADO.DocumentADO.GetInstant().UpdateItemEventStatus(x.Key.docItemID.Value, DocumentEventStatus.WORKING, this.BuVO);
            });*/

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
            
            if (mapsto == null || mapsto.eventStatus == StorageObjectEventStatus.IDEL)
            {
                if (mapsto != null && mapsto.eventStatus == StorageObjectEventStatus.IDEL)
                    ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(mapsto.id.Value, null, null, StorageObjectEventStatus.REMOVED, this.BuVO);

                var palletList = new List<PalletDataCriteria>();
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
                    palletData = palletList
                };

                mapsto = new WCSMappingPallet().Execute(this.Logger, this.BuVO, reqMapping);
            }


            mapsto.weiKG = reqVO.weight;
            mapsto.lengthM = reqVO.length;
            mapsto.heightM = reqVO.height;
            mapsto.widthM = reqVO.width;
            mapsto.warehouseID = _warehouseASRS.ID.Value;
            mapsto.areaID = _areaASRS.ID.Value;
            mapsto.parentID = _locationASRS.ID.Value;
            mapsto.parentType = StorageObjectType.LOCATION;

            ADO.StorageObjectADO.GetInstant()
                .PutV2(mapsto, this.BuVO);
            ADO.StorageObjectADO.GetInstant()
                .UpdateStatusToChild(mapsto.id.Value, StorageObjectEventStatus.IDEL, null, StorageObjectEventStatus.RECEIVING, this.BuVO);

            return mapsto;
        }


        private WorkQueueCriteria GenerateResponse(
            StorageObjectCriteria mapsto,
            SPworkQueue workQ)
        {
            var areaLocationMasters = ADO.AreaADO.GetInstant().ListAreaLocationMaster(
                new long[] { workQ.AreaLocationMaster_ID ?? 0, workQ.Des_AreaLocationMaster_ID ?? 0, workQ.Sou_AreaLocationMaster_ID ?? 00 },
                this.BuVO);


            var res = new WorkQueueCriteria()
            {
                queueID = workQ.ID,
                seq = workQ.Seq,
                queueParentID = workQ.Parent_WorkQueue_ID,
                queueRefID = workQ.RefID,
                queueStatus = workQ.EventStatus,
                
                souWarehouseCode = this.StaticValue.Warehouses.First(x => x.ID == workQ.Sou_Warehouse_ID).Code,
                souAreaCode = this.StaticValue.AreaMasters.First(x => x.ID == workQ.Sou_AreaMaster_ID).Code,
                souLocationCode = areaLocationMasters.Any(x=>x.ID==workQ.Sou_AreaLocationMaster_ID) ?
                                        areaLocationMasters.First(x => x.ID == workQ.Sou_AreaLocationMaster_ID).Code :
                                        null,

                desWarehouseCode = this.StaticValue.Warehouses.First(x => x.ID == workQ.Des_Warehouse_ID).Code,
                desAreaCode = this.StaticValue.AreaMasters.First(x => x.ID == workQ.Des_AreaMaster_ID).Code,
                desLocationCode = areaLocationMasters.Any(x => x.ID == workQ.Des_AreaLocationMaster_ID) ?
                                        areaLocationMasters.First(x => x.ID == workQ.Des_AreaLocationMaster_ID).Code :
                                        null,

                warehouseCode = this.StaticValue.Warehouses.First(x => x.ID == workQ.Warehouse_ID).Code,
                areaCode = this.StaticValue.AreaMasters.First(x => x.ID == workQ.AreaMaster_ID).Code,
                locationCode = areaLocationMasters.First(x => x.ID == workQ.AreaLocationMaster_ID).Code,

                
                baseInfo = new WorkQueueCriteria.BaseInfo()
                {
                    baseCode = mapsto.code,
                    packInfos = mapsto.ToTreeList()
                                    .Where(x=>x.type== StorageObjectType.PACK)
                                    .GroupBy(x=>new {
                                        packID = x.mstID,
                                        packCode = x.code,
                                        orderNo = x.orderNo,
                                        batch = x.batch,
                                        lot = x.lot
                                    })
                                    .Select(x=> {
                                        amv_PackMaster pkViw = ADO.DataADO.GetInstant().SelectByID<amv_PackMaster>(x.Key.packID, this.BuVO);
                                        var v = new WorkQueueCriteria.BaseInfo.PackInfo()
                                        {
                                            packCode = x.Key.packCode,
                                            packQty = x.Count(),
                                            skuCode = pkViw.SKUCode,
                                            skuQty = pkViw.ItemQty * x.Count(),
                                            
                                            orderNo = x.Key.orderNo,
                                            batch = x.Key.batch,
                                            lot = x.Key.lot
                                        };
                                        return v;
                                    })
                                    .ToList()
                }
            };

            return res;
        }

        //BEGIN*******************ProcessReceiving***********************
        private List<amt_DocumentItem> ProcessReceiving(StorageObjectCriteria mapsto, TReq reqVO)
        {
            List<amt_DocumentItem> docItems = new List<amt_DocumentItem>();
            var mapstoTree = mapsto.ToTreeList();
            foreach (var souWarehouse in mapstoTree
                                                    .Where(x => x.type == StorageObjectType.PACK && x.eventStatus == StorageObjectEventStatus.IDEL)
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
                    .ListItemCanMapV2(DocumentTypeID.GOODS_RECEIVED, packH.mstID, packH.baseQty, souWarehouseID, null, packH.unitID, packH.baseUnitID, null, packH.batch,null, this.BuVO)
                    .FirstOrDefault(x => x.EventStatus == DocumentEventStatus.WORKING || x.EventStatus == DocumentEventStatus.IDEL);


                //pack Info พบ Docitem ที่สามารถ Mapping ได้
                if (docItem != null)
                {
                    ADO.DocumentADO.GetInstant().MappingSTO(ConverterModel.ToDocumentItemStorageObject(packH, null, null, docItem.ID), this.BuVO);
                }
                else if(isAutoCreate)
                {
                    var doc = ADO.DocumentADO.GetInstant().List(DocumentTypeID.GOODS_RECEIVED, souWarehouseID, null, null, null, this.BuVO)
                        .FirstOrDefault(x => x.EventStatus == DocumentEventStatus.WORKING || x.EventStatus == DocumentEventStatus.IDEL);
                    //Pack Info ไม่พบ Document Item ใดๆที่ตรงกับในระบบ
                    if (doc == null)
                    {

                        doc = new Engine.Business.Received.CreateGRDocument().Execute(this.Logger, this.BuVO,
                            new CreateGRDocument.TReq()
                            {
                                refID = null,
                                ref1 = null,
                                ref2 = this.StaticValue.Warehouses.First(x => x.ID == souWarehouseID).Code == "5005" ? "311" : "321",//TODO FIX SAPCODE
                                souBranchID = this.StaticValue.Warehouses.First(x => x.ID == souWarehouseID).Branch_ID,
                                souWarehouseID = souWarehouseID,
                                desBranchID = this.StaticValue.Warehouses.First(x => x.ID == _warehouseASRS.ID).Branch_ID,
                                desWarehouseID = _warehouseASRS.ID,
                                desAreaMasterID = _areaASRS.ID,
                                orderNo = null,
                                lot = null,
                                batch = null,
                                documentDate = DateTime.Now,
                                eventStatus = DocumentEventStatus.WORKING,
                                receiveItems = new List<CreateGRDocument.TReq.ReceiveItem>() {
                                                    new CreateGRDocument.TReq.ReceiveItem
                                                    {
                                                        packCode = packH.code,
                                                        quantity = null,
                                                        unitType = packH.unitCode,

                                                        batch = packH.batch,
                                                        lot = null,//packH.lot,
                                                        orderNo = null,//packH.orderNo,


                                                        ref2 = this.StaticValue.Warehouses.First(y => y.ID == souWarehouseID).Code == "5005" ? "311" : "321",//TODO FIX SAPCODE

                                                        eventStatus = DocumentEventStatus.WORKING,
                                                        docItemStos = new List<amt_DocumentItemStorageObject>() { ConverterModel.ToDocumentItemStorageObject(packH) }

                                                    }}
                            });
                        //ADO.DocumentADO.GetInstant().Create(doc, this.BuVO);
                    }
                    //Pack Info พบ Document แต่ไม่พบ DocumentItem
                    else
                    {
                        var packConvert = this.StaticValue.ConvertToBaseUnitByPack(packH.id.Value, 1, packH.unitID);
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
                            Ref2 = this.StaticValue.Warehouses.First(y => y.ID == souWarehouseID).Code == "5005" ? "311" : "321",//TODO FIX SAPCODE

                            DocItemStos = new List<amt_DocumentItemStorageObject>() { ConverterModel.ToDocumentItemStorageObject(packH) }
                        };
                        ADO.DocumentADO.GetInstant().CreateItem(docItem, this.BuVO);
                    }
                }
                else
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.V2002, "ไม่สามารถรับเข้ารายการ '" + string.Join(',', packs.Select(x => x.code).ToArray()) + "' เนื่องจากไม่มีเอกสาร Goods Receive");
                }
                packH.eventStatus = StorageObjectEventStatus.RECEIVED;
                docItems.Add(docItem);
            }
            return docItems;
        }
        //END*******************ProcessReceiving***********************

        //BEGIN*******************ProcessRegisterWorkQueue***********************
        private SPworkQueue ProcessRegisterWorkQueue(
            List<amt_DocumentItem> docItems, StorageObjectCriteria mapsto, TReq reqVO)
        {
            var desAreas = ADO.AreaADO.GetInstant().ListDestinationArea(mapsto.areaID, _locationASRS.ID, this.BuVO);
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
