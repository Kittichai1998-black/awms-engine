using AMWUtil.Common;
using AMWUtil.Exception;
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
            public List<PalletDataCriteria> mappingPallets;
            public DateTime actualTime;
        }
        
        protected override WorkQueueCriteria ExecuteEngine(TReq reqVO)
        {
            var wm = this.StaticValue.Warehouses.FirstOrDefault(x => x.Code == reqVO.warehouseCode);
            if (wm == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Warehouse Code '" + reqVO.warehouseCode + "'");
            var am = this.StaticValue.AreaMasters.FirstOrDefault(x => x.Code == reqVO.areaCode && x.Warehouse_ID == wm.ID);
            if (am == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Area Code '" + reqVO.areaCode + "'");
            var alm = ADO.DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>(
                new KeyValuePair<string, object>[] {
                    new KeyValuePair<string,object>("Code",reqVO.locationCode),
                    new KeyValuePair<string,object>("AreaMaster_ID",am.ID.Value),
                    new KeyValuePair<string,object>("Status", EntityStatus.ACTIVE)
                }, this.BuVO).FirstOrDefault();
            if (alm == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Location Code '" + reqVO.locationCode + "'");

            this.MappingPallet(reqVO);

            var mapsto = ADO.StorageObjectADO.GetInstant().Get(reqVO.baseCode, wm.ID, null, false, true, this.BuVO);
            if (mapsto == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Base Code '" + reqVO.baseCode + "'");

            List<amt_DocumentItem> docItemsInSto = null;
            if (mapsto.eventStatus == StorageObjectEventStatus.IDEL)
            {
                docItemsInSto = this.GetReceiveDocumentItem(mapsto, reqVO);

                var doc = this.CreateDocument(reqVO, wm.ID.Value, mapsto);
                foreach (var docItem in doc.DocumentItems)
                {
                    var treeSto = mapsto.ToTreeList();
                    var getStoID = treeSto.Where(x => x.mstID == docItem.PackMaster_ID).Select(x => x.id.Value).ToList();
                    ADO.DocumentADO.GetInstant().MappingSTO(docItem.ID.Value, getStoID, this.BuVO);
                }

                mapsto.eventStatus = StorageObjectEventStatus.RECEIVING;


            }
            else if (mapsto.eventStatus == StorageObjectEventStatus.AUDITING || mapsto.eventStatus == StorageObjectEventStatus.AUDITED)
            {
                //this.ValidateAuditReturn(mapsto, reqVO);
            }
            else if (mapsto.eventStatus == StorageObjectEventStatus.RECEIVED)
            {
                List<long> itemList = mapsto.ToTreeList().Select(x => x.id.Value).ToList();
                var stoList = ADO.DocumentADO.GetInstant().ListStoIDInDocs(itemList, DocumentTypeID.PICKING, this.BuVO);
                if(stoList.Count > 0)
                    throw new AMWException(this.Logger, AMWExceptionCode.V2002, "ไม่สามารถรับ Base Code '" + reqVO.baseCode + "' เข้าคลังได้ เนื่องจากงาน Picking ยังไม่เรียบร้อย");
                //this.ValidateWarehouseMoving(mapsto, reqVO);
            }
            else
                throw new AMWException(this.Logger, AMWExceptionCode.V2002, "ไม่สามารถรับ Base Code '" + reqVO.baseCode + "' เข้าคลังได้ เนื่องจากมีสถานะ '" + mapsto.eventStatus + "'");
            
            var desAreas = ADO.AreaADO.GetInstant().ListDestinationArea(mapsto.areaID, alm.ID, this.BuVO);
            var desAreaDefault = desAreas.OrderByDescending(x => x.DefaultFlag).FirstOrDefault();
            SPworkQueue workQ = new SPworkQueue()
            {
                ID = null,
                IOType = IOType.INPUT,
                ActualTime = reqVO.actualTime,
                Parent_WorkQueue_ID = null,
                Priority = 1,
                TargetStartTime = null,
                Document_ID = null, //****ต้องทำเพิ่ม (เอกสาร Moving)
                DocumentItem_ID = null,
                StorageObject_ID = mapsto.id,
                StorageObject_Code = mapsto.code,

                Warehouse_ID = wm.ID.Value,
                AreaMaster_ID = am.ID.Value,
                AreaLocationMaster_ID = alm.ID,

                Sou_Warehouse_ID = wm.ID.Value,
                Sou_AreaMaster_ID = am.ID.Value,
                Sou_AreaLocationMaster_ID = alm.ID,

                Des_Warehouse_ID = this.StaticValue.AreaMasters.First(x => x.ID == desAreaDefault.Des_AreaMaster_ID).Warehouse_ID.Value,
                Des_AreaMaster_ID = desAreaDefault.Des_AreaMaster_ID.Value,
                Des_AreaLocationMaster_ID = desAreaDefault.Des_AreaLocationMaster_ID,

                EventStatus = WorkQueueEventStatus.WORKING,
                Status = EntityStatus.ACTIVE,
                
            };
            ADO.QueueADO.GetInstant().PUT(workQ, this.BuVO);

            mapsto.weiKG = reqVO.weight;
            mapsto.lengthM = reqVO.length;
            mapsto.heightM = reqVO.height;
            mapsto.widthM = reqVO.width;
            mapsto.warehouseID = wm.ID.Value;
            mapsto.areaID = am.ID.Value;
            mapsto.parentID = alm.ID.Value;
            mapsto.parentType = StorageObjectType.LOCATION;

            ADO.StorageObjectADO.GetInstant()
                .UpdateStatusToChild(mapsto.id.Value, StorageObjectEventStatus.IDEL, null, StorageObjectEventStatus.RECEIVING, this.BuVO);
            ADO.StorageObjectADO.GetInstant()
                .PutV2(mapsto, this.BuVO);

            docItemsInSto.GroupBy(x => new { docID = x.Document_ID }).ToList().ForEach(x =>
            {
                ADO.DocumentADO.GetInstant().UpdateEventStatus(x.Key.docID, DocumentEventStatus.WORKING, this.BuVO);
            });
            docItemsInSto.GroupBy(x => new { docItemID = x.ID }).ToList().ForEach(x =>
            {
                ADO.DocumentADO.GetInstant().UpdateItemEventStatus(x.Key.docItemID.Value, DocumentEventStatus.WORKING, this.BuVO);
            });

            var res = this.GenerateResponse(mapsto, workQ);
            return res;
        }

        private List<amt_DocumentItem> GetReceiveDocumentItem(StorageObjectCriteria mapsto, TReq reqVO)
        {
            var mapstoTree = mapsto.ToTreeList();
            var packReceivigngs = mapstoTree.FindAll(x => x.type == StorageObjectType.PACK && x.eventStatus == StorageObjectEventStatus.IDEL);
            var docItems = ADO.DocumentADO.GetInstant()
                .ListItemBySTO(
                    packReceivigngs.Select(x => x.id.Value).ToList(),
                    DocumentTypeID.GOODS_RECEIVED,
                    this.BuVO);

            //if (docItems.Count == 0)
            //    throw new AMWException(this.Logger, AMWExceptionCode.V2002, "ไม่สามารถรับเข้าได้. เนื่องจากไม่มีเอกสาร Goods Receve อ้างอิง");

            return docItems;
        }

        //private void ValidateAuditReturn(StorageObjectCriteria mapsto, TReq reqVO)
        //{
        //    var mapstoTree = mapsto.ToTreeList();
        //    var packAudits = mapstoTree.FindAll(
        //                            x => x.type == StorageObjectType.PACK && 
        //                            (x.eventStatus == StorageObjectEventStatus.AUDITING || x.eventStatus == StorageObjectEventStatus.AUDITED));
        //    var docs = ADO.DocumentADO.GetInstant()
        //        .ListBySTO(
        //            packAudits.Select(x => x.id.Value).ToList(),
        //            DocumentTypeID.STOCK_AUDIT,
        //            this.BuVO);
        //    List<dynamic> stoInDocs = new List<dynamic>();
        //    docs.ForEach(x =>
        //    {
        //        if (x.EventStatus != DocumentEventStatus.WORKING)
        //            throw new AMWException(this.Logger, AMWExceptionCode.V2002, "ไม่สามารถรับเข้าได้. เอกสาร Stock Audit มีสถานะ '" + x.EventStatus + "'");

        //        var sids = ADO.DocumentADO.GetInstant().ListStoIDInDocs(x.ID.Value, this.BuVO);
        //        stoInDocs.AddRange(sids.Select(y => new {
        //            StorageObject_ID = y.StorageObject_ID,
        //            DocumentItem_ID = y.DocumentItem_ID,
        //            Document_ID = x.ID.Value
        //        }));
        //    });

        //    if (!packAudits.TrueForAll(x => stoInDocs.Any(y => y.StorageObjec_ID == x.id)))
        //        throw new AMWException(this.Logger, AMWExceptionCode.V2002, "ไม่สามารถรับเข้าได้. สินค้าไม่มีเอกสาร Stock Audit อ้างอิง");
        //}

        //private void ValidateWarehouseMoving(StorageObjectCriteria mapsto, TReq reqVO)
        //{

        //}

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

        private StorageObjectCriteria MappingPallet(TReq reqVO)
        {
            var getSTO = ADO.StorageObjectADO.GetInstant().Get(reqVO.baseCode,
                ADO.StaticValue.StaticValueManager.GetInstant().Warehouses.FirstOrDefault(x => x.Code == reqVO.warehouseCode).ID,
                null, false, true, this.BuVO);

            if (getSTO == null)
            {
                var palletList = new List<PalletDataCriteria>();
                foreach (var row in reqVO.mappingPallets)
                {
                    palletList.Add(new PalletDataCriteria()
                    {
                        source = "Sou_Warehouse_ID=" + row.source,
                        code = row.code,
                        batch = row.batch,
                        qty = row.qty,
                        baseUnit = row.baseUnit,
                        stampDate = row.stampDate,
                        warehouseCode = reqVO.warehouseCode,
                        areaCode = reqVO.areaCode,
                        movingType = row.movingType
                    });
                }

                var reqMapping = new WCSMappingPallet.TReq()
                {
                    palletData = palletList
                };

                var resMapping = new WCSMappingPallet().Execute(this.Logger, this.BuVO, reqMapping);
                return resMapping;
            }
            else
            {
                return getSTO;
            }
        }

        private amt_Document CreateDocument(TReq reqVO, long wmID, StorageObjectCriteria mapsto)
        {   
            if (this.StaticValue.Warehouses.FirstOrDefault(x => x.Code == reqVO.mappingPallets[0].source) != null)
            {
                var getItemDoc = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItem>(
                    new KeyValuePair<string, object>[] {
                                new KeyValuePair<string,object>("Ref1", reqVO.mappingPallets[1].source),
                                new KeyValuePair<string,object>("Ref2", reqVO.mappingPallets[1].movingType),
                                new KeyValuePair<string,object>("Ref3", reqVO.mappingPallets[1].batch),
                                new KeyValuePair<string,object>("Status", EntityStatus.ACTIVE)
                    }, this.BuVO).FirstOrDefault();

                var getDoc = new amt_Document();
                if (getItemDoc == null)
                {
                    getDoc = new CreateGRDocumentBySTO().Execute(this.Logger, this.BuVO, new CreateGRDocumentBySTO.TReq { stomap = mapsto });
                }
                else
                {
                    getDoc = ADO.DataADO.GetInstant().SelectBy<amt_Document>(
                        new KeyValuePair<string, object>[] {
                                        new KeyValuePair<string,object>("Document_ID", getItemDoc.Document_ID),
                                        new KeyValuePair<string,object>("Status", EntityStatus.ACTIVE)
                        }, this.BuVO).FirstOrDefault();
                    var treelist = mapsto.ToTreeList();

                    var resx = treelist.Where(x => x.objectSizeID == 2).GroupBy(x => new { code = x.code, mstID = x.mstID, options = x.options, productDate = x.productDate })
                        .Select(x => new { key = x.Key, count = x.Count(), stoIDs = x.Select(y => y.id.Value).ToList() });

                    foreach (var x in resx)
                    {
                        var packmst = ADO.DataADO.GetInstant().SelectByID<ams_PackMaster>(x.key.mstID, this.BuVO);

                        getDoc.DocumentItems.Add(new amt_DocumentItem()
                        {
                            SKUMaster_ID = packmst.SKUMaster_ID,
                            PackMaster_ID = x.key.mstID,
                            Code = packmst.Code,
                            ID = null,
                            EventStatus = DocumentEventStatus.WORKING,
                            Options = x.key.options,
                            Quantity = null,
                            ExpireDate = null,
                            ProductionDate = x.key.productDate,
                            Ref1 = null,
                            Ref2 = null,
                            RefID = null,
                            StorageObjectIDs = x.stoIDs
                        });
                    };

                    if (resx.Count() > 0)
                    {
                        getDoc = ADO.DocumentADO.GetInstant().Create(getDoc, BuVO);
                    }
                }

                return getDoc;


            }
            else
                throw new AMWException(this.Logger, AMWExceptionCode.V2001, "ไม่มีข้อมูล Warehouse ในระบบ");
        }
    }
}
