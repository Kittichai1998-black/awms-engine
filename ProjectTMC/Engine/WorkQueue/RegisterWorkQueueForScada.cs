using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.ADO.StaticValue;
using AWMSEngine.Common;
using AWMSEngine.Engine;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Request;
using AWMSModel.Criteria.SP.Response;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Common;
using AWMSEngine.Engine.V2.Business.WorkQueue;

namespace ProjectTMC.Engine.WorkQueue
{
    public class RegisterWorkQueueForScada : BaseQueue<RegisterWorkQueueForScada.TReq, WorkQueueCriteria>
    {
        public class TReq
        {
            public string interface_no;
            public string ref_id;
            public string sku_code;
            public int? qty;
        }
        public class TRes
        {
            public Data data;
            public Result _result;
            public class Data
            {
                public string ref_id;
                public string sku_code;
                public int? qty;
                public string unit;
            }
            public class Result
            {
                public int status;
                public dynamic message;
            }
        }
        public class TempMVTDocItems
        {
            public amt_DocumentItem docItem;
            public DocumentProcessTypeID processID;
        }
        private ams_AreaMaster _areaASRS;
        private ams_AreaLocationMaster _locationASRS;
        private ams_Warehouse _warehouseASRS;
        private ams_Branch _branchASRS;

        protected override WorkQueueCriteria ExecuteEngine(TReq reqVO)
        {
            //get  area by interface no.
            this.InitDataASRS(reqVO);

            // สร้าง sto, document เเล้วส่งไปหา wc 
            var sto = GetSto(reqVO);

            if (sto != null)
            {
                var docItem = GetDocumentItemAndDISTO(sto, reqVO);
                var desLocation = this.GetDesLocations(sto, reqVO);
                var queueTrx = this.CreateWorkQueue(sto, docItem, desLocation, reqVO);

                if (sto.eventStatus == StorageObjectEventStatus.NEW)
                    AWMSEngine.ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(sto.id.Value, null,
                    StaticValueManager.GetInstant().GetStatusInConfigByEventStatus<StorageObjectEventStatus>(sto.eventStatus),
                    StorageObjectEventStatus.RECEIVING, this.BuVO);

                if (docItem.Count > 0)
                {
                    docItem.ForEach(x =>
                    {
                        x.DocItemStos.ForEach(disto =>
                        {
                            disto.WorkQueue_ID = queueTrx.ID.Value;
                            if (disto.Status == EntityStatus.INACTIVE)
                                AWMSEngine.ADO.DocumentADO.GetInstant().UpdateMappingSTO(disto.ID.Value, queueTrx.ID.Value, EntityStatus.INACTIVE, this.BuVO);
                            else
                                AWMSEngine.ADO.DocumentADO.GetInstant().UpdateMappingSTO(disto.ID.Value, queueTrx.ID.Value, EntityStatus.ACTIVE, this.BuVO);
                        });
                    });


                    var docIDs = docItem.Select(x => x.Document_ID).Distinct().ToList();
                    docIDs.ForEach(x =>
                    {
                        AWMSEngine.ADO.DocumentADO.GetInstant().UpdateStatusToChild(x, DocumentEventStatus.NEW, null, DocumentEventStatus.WORKING, this.BuVO);
                    });
                }
                return this.GenerateResponse(sto, queueTrx);

            }
            else
            {
                throw new Exception("Sto Invalid");
            }
        }


        private void InitDataASRS(TReq reqVO)
        {
            if(reqVO.interface_no == "3.2")
            {
                this._locationASRS = AWMSEngine.ADO.DataADO.GetInstant().SelectByCodeActive<ams_AreaLocationMaster>("G07", BuVO);
            }
            else if (reqVO.interface_no == "4.3")
            {
                this._locationASRS = AWMSEngine.ADO.DataADO.GetInstant().SelectByCodeActive<ams_AreaLocationMaster>("G08", BuVO);
            }
            else if (reqVO.interface_no == "6.2")
            {
                this._locationASRS = AWMSEngine.ADO.DataADO.GetInstant().SelectByCodeActive<ams_AreaLocationMaster>("G12", BuVO);
            }
            else if (reqVO.interface_no == "7.3" || reqVO.interface_no == "9.3")
            {
                this._locationASRS = AWMSEngine.ADO.DataADO.GetInstant().SelectByCodeActive<ams_AreaLocationMaster>("G13", BuVO);
            }
            else if (reqVO.interface_no == "8.2" || reqVO.interface_no == "10.2")
            {
                this._locationASRS = AWMSEngine.ADO.DataADO.GetInstant().SelectByCodeActive<ams_AreaLocationMaster>("G15", BuVO);
            }
            if (_locationASRS == null)
                throw new AMWException(Logger, AMWExceptionCode.V1001, "ไม่พบ Location ในระบบ");

            this._areaASRS = StaticValueManager.GetInstant().AreaMasters.FirstOrDefault(x => x.ID == _locationASRS.AreaMaster_ID);
            if (_areaASRS == null)
                throw new AMWException(Logger, AMWExceptionCode.V1001, "ไม่พบ Area ในระบบ");

            this._warehouseASRS = StaticValueManager.GetInstant().Warehouses.FirstOrDefault(x => x.ID == _areaASRS.Warehouse_ID);
            if (_warehouseASRS == null)
                throw new AMWException(Logger, AMWExceptionCode.V1001, "ไม่พบ Warehouse ในระบบ");

            this._branchASRS = StaticValueManager.GetInstant().Branchs.FirstOrDefault(x => x.ID == _warehouseASRS.Branch_ID);
            if (_branchASRS == null)
                throw new AMWException(Logger, AMWExceptionCode.V2001, "ไม่พบ Branch ในระบบ");

        }

        protected StorageObjectCriteria GetSto(TReq reqVO)
        {
            //bool isEmptyPallet = false;

            //var wqBaseLast = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_WorkQueue>(
            //           new SQLConditionCriteria[] {
            //            new SQLConditionCriteria("AreaLocation_ID", _locationASRS.ID.Value, SQLOperatorType.EQUALS ),
            //            new SQLConditionCriteria("Status", EntityStatus.DONE, SQLOperatorType.EQUALS ),
            //            new SQLConditionCriteria("IOType", IOType.OUTPUT, SQLOperatorType.EQUALS )
            //           }, new SQLOrderByCriteria[] { 
            //            new SQLOrderByCriteria("CreateTime",SQLOrderByType.DESC),
            //            new SQLOrderByCriteria("ModifyTime",SQLOrderByType.DESC)
            //           }, 1, null, BuVO).First();

            var stoBaseCurArea = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>(
                   new SQLConditionCriteria[] {
                        new SQLConditionCriteria("AreaMaster_ID", _areaASRS.ID.Value, SQLOperatorType.EQUALS ),
                        new SQLConditionCriteria("AreaLocationMaster_ID", _locationASRS.ID.Value, SQLOperatorType.EQUALS ),
                        new SQLConditionCriteria("EventStatus", StorageObjectEventStatus.NEW, SQLOperatorType.EQUALS ),
                        new SQLConditionCriteria("Status", EntityStatus.INACTIVE, SQLOperatorType.EQUALS ),
                        new SQLConditionCriteria("ObjectType", StorageObjectType.BASE, SQLOperatorType.EQUALS ),
                   }, new SQLOrderByCriteria[] {
                        new SQLOrderByCriteria("CreateTime",SQLOrderByType.DESC),
                        new SQLOrderByCriteria("ModifyTime",SQLOrderByType.DESC)
                   }, 1, null, BuVO).First();
            var _base = AWMSEngine.ADO.DataADO.GetInstant().SelectByCodeActive<ams_BaseMaster>(stoBaseCurArea.Code, BuVO);
            if (_base == null)
            { 
                throw new AMWException(Logger, AMWExceptionCode.V1001, "ไม่มีพาเลท : " + stoBaseCurArea.Code );
            }

            var _unitType = StaticValueManager.GetInstant().UnitTypes.FirstOrDefault(x => x.ID == _base.UnitType_ID);
            var _objSize = StaticValueManager.GetInstant().ObjectSizes.FirstOrDefault(x => x.ID == _base.ObjectSize_ID);


            //var stoBase = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(stoBaseCurArea.Code,
            //      null, _areaASRS.ID.Value, false, true, BuVO);
            

            var PackMaster = new ams_PackMaster();
            if (reqVO.sku_code == null || reqVO.sku_code.Length == 0)
            {
               // isEmptyPallet = true;
                
                PackMaster = AWMSEngine.ADO.DataADO.GetInstant().SelectByCodeActive<ams_PackMaster>("000000000", BuVO);
            }
            else
            {
                PackMaster = AWMSEngine.ADO.DataADO.GetInstant().SelectByCodeActive<ams_PackMaster>(reqVO.sku_code, BuVO);
            }
            if (PackMaster == null)
                throw new AMWException(Logger, AMWExceptionCode.V1001, "ไม่มีสินค้า : " + reqVO.sku_code );


            /* StorageObjectCriteria baseSto = new StorageObjectCriteria()
             {
                 code = wqBaseLast.StorageObject_Code,
                 eventStatus = StorageObjectEventStatus.NEW,
                 name = isEmptyPallet ? "Empty Pallet" : "Pallet",
                 qty = 1,
                 unitCode = _unitType.Code,
                 unitID = _unitType.ID.Value,
                 baseUnitCode = _unitType.Code,
                 baseUnitID = _unitType.ID.Value,
                 baseQty = 1,
                 objectSizeID = _objSize.ID.Value,
                 type = StorageObjectType.BASE,
                 mstID = _base.ID.Value,
                 objectSizeName = _objSize.Name,
                 areaID = _areaASRS.ID,
                 warehouseID = _warehouseASRS.ID.Value
                 //weiKG = reqVO.weight,
                 //lengthM = reqVO.length,
                 //heightM = reqVO.height,
                 //widthM = reqVO.width
             };*/


            var unit = StaticValueManager.GetInstant().UnitTypes.FirstOrDefault(x => x.ID == PackMaster.UnitType_ID);
            var _objSizePack = StaticValueManager.GetInstant().ObjectSizes.Find(x => x.ID == PackMaster.ObjectSize_ID);

            StorageObjectCriteria packSto = new StorageObjectCriteria()
            {
                parentID = stoBaseCurArea.ID.Value,
                parentType = StorageObjectType.BASE,
                code = PackMaster.Code,
                eventStatus = StorageObjectEventStatus.NEW,
                name = PackMaster.Name,
                qty = Convert.ToDecimal(reqVO.qty),
                skuID = PackMaster.SKUMaster_ID,
                unitCode = unit.Code,
                unitID = unit.ID.Value,
                baseUnitCode = unit.Code,
                baseUnitID = unit.ID.Value,
                baseQty = Convert.ToDecimal(reqVO.qty),
                objectSizeID = PackMaster.ObjectSize_ID,
                type = StorageObjectType.PACK,
                objectSizeName = _objSizePack.Name,
                mstID = PackMaster.ID.Value,
                areaID = _areaASRS.ID.Value,

            };
            AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(packSto, BuVO);

            var newSto = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(stoBaseCurArea.ID.Value,
                 StorageObjectType.BASE, false, true, BuVO);
            return newSto;
        }

        private List<amt_DocumentItem> GetDocumentItemAndDISTO(StorageObjectCriteria sto, TReq reqVO)
        {
            List<amt_DocumentItem> docItems = new List<amt_DocumentItem>();

            if (sto.eventStatus == StorageObjectEventStatus.NEW)
            {
                var pstoLists = sto.ToTreeList().Where(x => x.type == StorageObjectType.PACK).ToList();
                if (pstoLists == null || pstoLists.Count() == 0)
                    throw new AMWException(Logger, AMWExceptionCode.V2001, "ไม่มีข้อมูลของสินค้า");
                var souWarehouse = new ams_Warehouse();
                var souBranch = new ams_Branch();
                var desWarehouse = new ams_Warehouse();
                var desBranch = new ams_Branch();
                var desArea = new ams_AreaMaster();

                List<TempMVTDocItems> tempDocItems = new List<TempMVTDocItems>();

                foreach (var psto in pstoLists)
                {
                    ams_SKUMaster skuMaster = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<ams_SKUMaster>((long)psto.skuID, BuVO);
                    if (skuMaster == null)
                        throw new AMWException(Logger, AMWExceptionCode.V2001, "ไม่พบ SKU ID : " + (long)psto.skuID );
                    ams_PackMaster packMaster = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<ams_PackMaster>((long)psto.mstID, BuVO);
                    if (packMaster == null)
                        throw new AMWException(Logger, AMWExceptionCode.V2001, "ไม่พบ PackMaster ID " + (long)psto.mstID);

                    var sto_skuType = StaticValue.SKUMasterTypes.Find(x => x.ID == skuMaster.SKUMasterType_ID);
                    var skutypeg = sto_skuType.GroupType.GetValueInt(); 

                    DocumentProcessTypeID? docProcessTypeID = new DocumentProcessTypeID();
                    if(skutypeg == SKUGroupType.FG.GetValueInt())
                    {
                        docProcessTypeID = DocumentProcessTypeID.FG_TRANSFER_WM;
                    }
                    else if (skutypeg == SKUGroupType.WIP.GetValueInt())
                    {
                        docProcessTypeID = DocumentProcessTypeID.WIP_TRANSFER_WM;
                    }
                    else if (skutypeg == SKUGroupType.RAW.GetValueInt())
                    {
                        docProcessTypeID = DocumentProcessTypeID.RAW_TRANSFER_WM;
                    }
                    else if (skutypeg == SKUGroupType.EMP.GetValueInt())
                    {
                        docProcessTypeID = DocumentProcessTypeID.EPL_TRANSFER_WM;
                    }
                    else
                    {
                        throw new AMWException(Logger, AMWExceptionCode.V2001, "Document Process Type "+ docProcessTypeID + " ไม่ตรงกัยการรับเข้า");
                    }


                    var baseUnitTypeConvt = StaticValue.ConvertToBaseUnitByPack(packMaster.ID.Value, psto.qty, packMaster.UnitType_ID);
                    decimal? baseQuantity = null;
                    if (psto.qty >= 0)
                        baseQuantity = baseUnitTypeConvt.baseQty;

                    tempDocItems.Add(new TempMVTDocItems()
                    {
                        processID = docProcessTypeID.Value,
                        docItem = new amt_DocumentItem()
                        {
                            ID = null,
                            Code = psto.code,
                            SKUMaster_ID = psto.skuID.Value,
                            PackMaster_ID = packMaster.ID.Value,

                            Quantity = psto.qty,
                            UnitType_ID = baseUnitTypeConvt.newUnitType_ID,
                            BaseQuantity = baseQuantity,
                            BaseUnitType_ID = baseUnitTypeConvt.baseUnitType_ID,

                            OrderNo = psto.orderNo,
                            Batch = psto.batch,
                            Lot = psto.lot,

                            Options = null,
                            //ExpireDate = psto.expiryDate,
                            //ProductionDate = psto.productDate,
                            Ref1 = null,
                            Ref2 = null,
                            RefID = null,

                            EventStatus = DocumentEventStatus.NEW,
                            DocItemStos = new List<amt_DocumentItemStorageObject>() { ConverterModel.ToDocumentItemStorageObject(psto, null, null, null) }
                        }
                    });
                }

                var res_DI = tempDocItems.GroupBy(
                   p => new { p.processID }, (key, g) => new { DocProcessID = key.processID, DocItems = g.Select(y => y.docItem).ToList() });
                foreach (var di in res_DI)
                {
                    amt_Document doc = new amt_Document()
                    {
                        ID = null,
                        Code = null,
                        Lot = null,
                        Batch = null,
                        Sou_Customer_ID = null,
                        Sou_Supplier_ID = null,
                        Sou_Branch_ID = _branchASRS.ID,
                        Sou_Warehouse_ID = _warehouseASRS.ID,
                        Sou_AreaMaster_ID = null,

                        Des_Customer_ID = null,
                        Des_Supplier_ID = null,
                        Des_Branch_ID = _branchASRS.ID,
                        Des_Warehouse_ID = _warehouseASRS.ID,
                        Des_AreaMaster_ID = null,

                        DocumentDate = DateTime.Now,
                        ActionTime = DateTime.Now,
                        DocumentProcessType_ID = di.DocProcessID,
                        RefID = null,
                        Ref1 = null,
                        Ref2 = null,

                        DocumentType_ID = DocumentTypeID.GOODS_RECEIVED,
                        EventStatus = DocumentEventStatus.NEW,

                        Remark = null,
                        Options = null,
                        Transport_ID = null,

                        DocumentItems = di.DocItems,

                    };

                    var newDocument = AWMSEngine.ADO.DocumentADO.GetInstant().Create(doc, BuVO);
                    docItems.AddRange(AWMSEngine.ADO.DocumentADO.GetInstant().ListItemAndDisto(newDocument.ID.Value, BuVO));

                }


                return docItems;
            }
            else
            {
                throw new AMWException(Logger, AMWExceptionCode.V2002, "ไม่สามารถรับพาเลทเข้าคลังได้เนื่องจากมี EventStatus : '" + sto.eventStatus + "'");

            }
        }

        private SPOutAreaLineCriteria GetDesLocations(StorageObjectCriteria sto, TReq reqVO)
        {
            
                var desLocations = AWMSEngine.ADO.AreaADO.GetInstant().ListDestinationArea(IOType.INPUT, sto.areaID.Value, sto.parentID, this.BuVO);
                var res = desLocations.OrderByDescending(x => x.DefaultFlag).FirstOrDefault();
             
            return res;
        }
        private SPworkQueue CreateWorkQueue(StorageObjectCriteria sto, List<amt_DocumentItem> docItems, SPOutAreaLineCriteria location, TReq reqVO)
        {
            SPworkQueue workQ = new SPworkQueue()
            {
                ID = null,
                IOType =IOType.INPUT,
                ActualTime = DateTime.Now,
                Parent_WorkQueue_ID = null,
                Priority = 1,
                TargetStartTime = null,

                StorageObject_ID = sto.id,
                StorageObject_Code = sto.code,

                Warehouse_ID = _warehouseASRS.ID.Value,
                AreaMaster_ID = _areaASRS.ID.Value,
                AreaLocationMaster_ID = _locationASRS.ID.Value,


                Sou_Warehouse_ID = _warehouseASRS.ID.Value,
                Sou_AreaMaster_ID = _areaASRS.ID.Value,
                Sou_AreaLocationMaster_ID = _locationASRS.ID.Value,

                Des_Warehouse_ID = this.StaticValue.AreaMasters.First(x => x.ID == location.Des_AreaMaster_ID).Warehouse_ID.Value,
                Des_AreaMaster_ID = location.Des_AreaMaster_ID.Value,
                Des_AreaLocationMaster_ID = location.Des_AreaLocationMaster_ID,

                EventStatus = WorkQueueEventStatus.WORKING,
                Status = EntityStatus.ACTIVE,
                StartTime = DateTime.Now,

                DocumentItemWorkQueues = AWMSEngine.Common.ConverterModel.ToDocumentItemWorkQueue(docItems, sto)
            };
            workQ = AWMSEngine.ADO.WorkQueueADO.GetInstant().PUT(workQ, this.BuVO);
            return workQ;
        }
    }
}
