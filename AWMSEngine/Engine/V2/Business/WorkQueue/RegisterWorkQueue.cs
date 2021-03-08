using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Criteria.SP.Request;
using AMSModel.Criteria.SP.Response;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using AMWUtil.Exception;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.Common;
using AMWUtil.Logger;
using AMSModel.Constant.StringConst;
using ADO.WMSStaticValue;
using AWMSEngine.Engine.V2.General;
using AWMSEngine.Engine.V2.Business.Received;
using Newtonsoft.Json;

namespace AWMSEngine.Engine.V2.Business.WorkQueue
{
    public class RegisterWorkQueue : BaseQueue<RegisterWorkQueue.TReq, WorkQueueCriteria>
    {
        public class TReq : RequestRegisterWQCriteria
        {
        }

        public class TReqDocumentItemAndDISTO
        {
            public StorageObjectCriteria sto;
            public TReq reqVO;
        }

        private ams_AreaMaster _areaASRS;
        private ams_AreaLocationMaster _locationASRS;
        private ams_Warehouse _warehouseASRS;
        private ams_Branch _branchASRS;

        public class TempMVTDocItems
        {
            public amt_DocumentItem docItem;
            public DocumentProcessTypeID processID;
            public long? parentDocID;
        }
        public class LocationList
        {
            public int bank;
            public int level;
            public int qty;
            public int receive = 0;
        }
        protected override WorkQueueCriteria ExecuteEngine(TReq reqVO)
        {
            this.InitDataASRS(reqVO);

            var sto = GetSto(reqVO);

            this.SetWeiChildAndUpdateInfoToChild(sto, reqVO.weight ?? 0);
            this.ValidateObjectSizeLimit(sto);
            var docItem = GetDocumentItemAndDISTO(sto, reqVO);
            var desLocation = this.GetDesLocations(sto, reqVO);
            if (desLocation == null)
            {
                throw new AMWException(Logger, AMWExceptionCode.V1001, "ไม่สามารถนำพาเลทรับเข้าผ่าน Area นี้ได้");
            }
            var queueTrx = this.CreateWorkQueue(sto, docItem, desLocation, reqVO);
            if (queueTrx.IOType == IOType.OUTBOUND)
            {
                ADO.WMSDB.StorageObjectADO.GetInstant().UpdateStatusToChild(sto.id.Value, null,
                StaticValueManager.GetInstant().GetStatusInConfigByEventStatus<StorageObjectEventStatus>(sto.eventStatus),
                StorageObjectEventStatus.PACK_PICKING, this.BuVO);
            }
            else
            {
                var packs = sto.ToTreeList().FindAll(x => x.type == StorageObjectType.PACK);
                packs.ForEach(pack => {
                    if (pack.eventStatus == StorageObjectEventStatus.PACK_NEW)
                    {
                        ADO.WMSDB.StorageObjectADO.GetInstant().UpdateStatus(pack.id.Value, null, null, StorageObjectEventStatus.PACK_RECEIVING, this.BuVO);
                    }
                });

            }

            if (docItem.Count > 0)
            {
                docItem.ForEach(x =>
                {
                    var stoLists = sto.ToTreeList().FindAll(y => y.type == StorageObjectType.PACK).Select(y => y.id).ToList();
                    var disto = x.DocItemStos.FindAll(y => stoLists.Contains(y.Sou_StorageObject_ID));
                    disto.ForEach(disto =>
                    {
                        disto.WorkQueue_ID = queueTrx.ID.Value;
                        if (disto.Status == EntityStatus.INACTIVE)
                            ADO.WMSDB.DistoADO.GetInstant().Update(disto.ID.Value, queueTrx.ID.Value, EntityStatus.INACTIVE, this.BuVO);
                        else
                            ADO.WMSDB.DistoADO.GetInstant().Update(disto.ID.Value, queueTrx.ID.Value, EntityStatus.ACTIVE, this.BuVO);
                    });
                    x.EventStatus = DocumentEventStatus.WORKING;
                    ADO.WMSDB.DocumentADO.GetInstant().UpdateItemEventStatus(x.ID.Value, DocumentEventStatus.WORKING, this.BuVO);

                });


                var docIDs = docItem.Select(x => x.Document_ID).Distinct().ToList();
              
                docIDs.ForEach(x =>
                {
                   
                    var docPA = ADO.WMSDB.DocumentADO.GetInstant().GetDocumentAndDocItems(x, BuVO);
                    //add options rev
                    var location = AMWUtil.Common.ObjectUtil.QryStrGetValue(docPA.Options, OptionVOConst.OPT_LOCATION);
                    if (location != null)
                        {                 
                            var loc_json = JsonConvert.DeserializeObject<LocationList>(location);
                                loc_json.receive = loc_json.receive + 1;
                            var loc_string = JsonConvert.SerializeObject(loc_json);
                            var opt_loc_doc = AMWUtil.Common.ObjectUtil.QryStrSetValue(docPA.Options, OptionVOConst.OPT_LOCATION, loc_string.ToString());
                    
                            ADO.WMSDB.DataADO.GetInstant().UpdateByID<amt_Document>(docPA.ID.Value, this.BuVO,
                                new KeyValuePair<string, object>[] {
                                    new KeyValuePair<string, object>("Options", opt_loc_doc)
                                });
                        }
                    if (docPA.DocumentItems.Any(item => item.EventStatus == DocumentEventStatus.WORKING))
                    {
                        ADO.WMSDB.DocumentADO.GetInstant().UpdateEventStatus(x, DocumentEventStatus.WORKING, this.BuVO);

                        var getGR = ADO.WMSDB.DocumentADO.GetInstant().GetDocumentAndDocItems(docPA.ParentDocument_ID.Value, this.BuVO);
                        //add options rev
                        if (location != null)
                        {
                            var loc_json = JsonConvert.DeserializeObject<LocationList>(location);
                            loc_json.receive = loc_json.receive + 1;
                            var loc_string = JsonConvert.SerializeObject(loc_json);
                            var opt_loc_doc = AMWUtil.Common.ObjectUtil.QryStrSetValue(docPA.Options, OptionVOConst.OPT_LOCATION, loc_string.ToString());

                            ADO.WMSDB.DataADO.GetInstant().UpdateByID<amt_Document>(getGR.ID.Value, this.BuVO,
                              new KeyValuePair<string, object>[] {
                                new KeyValuePair<string, object>("Options", opt_loc_doc)
                              });
                        }
                        
                        docPA.DocumentItems.ForEach(item => {
                            if (item.EventStatus == DocumentEventStatus.WORKING)
                            {
                                var grItem = getGR.DocumentItems.Find(y => y.ID == item.ParentDocumentItem_ID);
                                grItem.EventStatus = DocumentEventStatus.WORKING;
                                ADO.WMSDB.DocumentADO.GetInstant().UpdateItemEventStatus(grItem.ID.Value, DocumentEventStatus.WORKING, this.BuVO);
                            }
                        });

                        ADO.WMSDB.DocumentADO.GetInstant().UpdateEventStatus(getGR.ID.Value, DocumentEventStatus.WORKING, this.BuVO);
                    }
                });
            }
            else
            {
                var packs = sto.ToTreeList().FindAll(x => x.type == StorageObjectType.PACK);
                packs.ForEach(pack => {
                    var getDisto = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(new SQLConditionCriteria[]
                        {
                            new SQLConditionCriteria("Sou_StorageObject_ID", pack.id, SQLOperatorType.EQUALS),
                            new SQLConditionCriteria("Status", EntityStatus.INACTIVE, SQLOperatorType.EQUALS),
                            //new SQLConditionCriteria("DocumentItem_ID", null, SQLOperatorType.EQUALS),
                        }, this.BuVO).Find(c => c.DocumentItem_ID == null);

                    ADO.WMSDB.DistoADO.GetInstant().Update(getDisto.ID.Value, queueTrx.ID.Value, EntityStatus.INACTIVE, this.BuVO);
                });

            }
            var res = this.GenerateResponse(sto, queueTrx);
            var LocationCondition = ADO.WMSDB.StorageObjectADO.GetInstant().ListLocationCondition(new List<long> { sto.id.Value }, BuVO).FirstOrDefault();
            if (LocationCondition == null)
            {
                throw new AMWException(Logger, AMWExceptionCode.V2002, "ไม่พบ location ที่สามารถจัดเก็บในคลังสินค้าได้");
            }
            else
            {
                res.locationBankNumRange = LocationCondition.LocationBankNumRange;
                res.locationBayNumRange = LocationCondition.LocationBayNumRange;
                res.locationLvNumRange = LocationCondition.LocationLvNumRange;
            }
            return res;

        }

        public StorageObjectCriteria GetSto(TReq reqVO)
        {

            var sto = ADO.WMSDB.StorageObjectADO.GetInstant().Get(reqVO.baseCode,
                        null, null, false, true, BuVO);


            if (sto == null)
            {
                if (reqVO.barcode_pstos != null && reqVO.barcode_pstos.Count > 0)
                {
                    sto = this.CreateSto(reqVO);
                }
                else
                {
                    throw new AMWException(Logger, AMWExceptionCode.V1001, "Data of Pallet and Mapping Not Found");
                }
            }
            else
            {
                if (reqVO.barcode_pstos != null && reqVO.barcode_pstos.Count > 0)
                {
                    var stopacks = sto.ToTreeList().Where(x => x.type == StorageObjectType.PACK).ToList();
                    if (stopacks == null || stopacks.Count == 0)
                    {
                        ADO.WMSDB.StorageObjectADO.GetInstant().UpdateStatusToChild(sto.id.Value, StorageObjectEventStatus.PACK_NEW, null, StorageObjectEventStatus.PACK_REMOVED, this.BuVO);

                        sto = this.CreateSto(reqVO);
                    }
                }
            }
            // end
            if (sto.code != reqVO.baseCode)
                throw new AMWException(Logger, AMWExceptionCode.V1001, "Base Code: '" + reqVO.baseCode + "' INCORRECT");

            var stopack = sto.ToTreeList().Where(x => x.type == StorageObjectType.PACK).ToList();
            if (stopack == null || stopack.Count == 0)
                throw new AMWException(Logger, AMWExceptionCode.V1001, "Data of Packs Not Found");


            sto.lengthM = reqVO.length;
            sto.heightM = reqVO.height;
            sto.widthM = reqVO.width;
            sto.warehouseID = _warehouseASRS.ID.Value;
            sto.areaID = _areaASRS.ID.Value;
            sto.parentID = _locationASRS.ID.Value;
            sto.parentType = StorageObjectType.LOCATION;

            sto.options = ObjectUtil.QryStrSetValue(sto.options, OptionVOConst.OPT_REMARK, reqVO.options); 

            return sto;
        }
        public StorageObjectCriteria CreateSto(TReq reqVO)
        {
            StorageObjectCriteria newSto = new StorageObjectCriteria();

            var req_ScanMappingSTO = new ScanMappingSTO.TReq()
            {
                bstoCode = reqVO.baseCode,
                areaID = _areaASRS.ID.Value,
                locationID = _locationASRS.ID.Value,
                warehouseID = _warehouseASRS.ID.Value
            };
            long? bstoID = null;

            reqVO.barcode_pstos.ForEach((pstos) =>
            {
                var getpackSto = new GetDocByQRCode().Execute(this.Logger, this.BuVO, new GetDocByQRCode.TReq() { qr = pstos });
                req_ScanMappingSTO.processType = getpackSto.processType;
                if(bstoID != null)
                {
                    req_ScanMappingSTO.bstoID = bstoID;
                }
                if(getpackSto.datas != null || getpackSto.datas.Count > 0)
                {
                    List<ScanMappingSTO.TReq.PackSto> packStos = new List<ScanMappingSTO.TReq.PackSto>();
                    getpackSto.datas.ForEach(data => {
                        packStos.Add(new ScanMappingSTO.TReq.PackSto() {
                            pstoCode = data.pstoCode,
                            batch = data.batch,
                            lot = data.lot,
                            orderNo = data.orderNo,
                            itemNo = data.itemNo,
                            refID = data.refID,
                            ref1 = data.ref1,
                            ref2 = data.ref2,
                            ref3 = data.ref3,
                            ref4 = data.ref4,
                            forCustomerID = data.forCustomerID,
                            cartonNo = data.cartonNo,
                            options = data.options,
                            addQty = data.addQty,
                            unitTypeCode = data.unitTypeCode,
                            packUnitTypeCode = data.packUnitTypeCode,
                            expiryDate = data.expiryDate,
                            productDate = data.productDate,
                            auditStatus = data.auditStatus
                        });
                    });
                    req_ScanMappingSTO.pstos = packStos;
                    var newMapSto = new ScanMappingSTO().Execute(this.Logger, this.BuVO, req_ScanMappingSTO); ;
                    newSto = newMapSto.bsto;
                    bstoID = newMapSto.bsto.id.Value;
                }


            });

            return newSto;
        }
        public List<amt_DocumentItem> GetDocumentItemAndDISTO(StorageObjectCriteria sto, TReq reqVO)
        {
            List<amt_DocumentItem> res = null;
            if (res == null)
            {
                var packs = sto.ToTreeList().FindAll(x => x.type == StorageObjectType.PACK);
                if (packs == null || packs.Count() == 0)
                    throw new AMWException(Logger, AMWExceptionCode.V2001, "Data of Packs Not Found");

                ////DF Code
                List<amt_DocumentItem> docItems = new List<amt_DocumentItem>();
                if (reqVO.ioType == IOType.OUTBOUND)
                {
                    //สร้างเอกสารเบิกpallet เปล่า
                    //get Document
                    var docItemLists = ADO.WMSDB.DocumentADO.GetInstant().ListItemBySTO(packs.Select(x => x.id.Value).ToList(),
                        DocumentTypeID.PICKING, BuVO);
                    if (docItemLists == null || docItemLists.Count == 0)
                    {
                        docItems = this.ProcessPickingESP(sto, reqVO);
                    }
                    else
                    {
                        docItemLists.ForEach(di =>
                        {
                            docItems.Add(ADO.WMSDB.DocumentADO.GetInstant().GetItemAndStoInDocItem(di.ID.Value, BuVO));
                        });
                    }

                }
                else
                { 

                    //รับสินค้าใหม่เข้าคลัง, รับเข้าpallet เปล่า, 
                    if (packs.TrueForAll(pack => pack.eventStatus == StorageObjectEventStatus.PACK_NEW))
                    {
                        //get Document
                        var docItemLists = ADO.WMSDB.DocumentADO.GetInstant().ListItemBySTO(packs.Select(x => x.id.Value).ToList(),
                            DocumentTypeID.PUTAWAY, BuVO);
                        if (docItemLists == null || docItemLists.Count == 0)
                        {
                            throw new AMWException(Logger, AMWExceptionCode.V2001, "Document Item Not Found");
                        }
                        else
                        {  

                            docItemLists.ForEach(di =>
                            {
                                docItems.Add(ADO.WMSDB.DocumentADO.GetInstant().GetItemAndStoInDocItem(di.ID.Value, BuVO));
                            });
                        }

                        if (docItems == null || docItems.Count == 0)
                            throw new AMWException(Logger, AMWExceptionCode.V2001, "Put Away Document Not Found");
                    }
                    else if (packs.TrueForAll(pack => pack.eventStatus.Attribute<StorageObjectEventStatusAttr>() != null && pack.eventStatus.Attribute<StorageObjectEventStatusAttr>().IsPutawayBypassASRS))
                    {
                        //ถ้าพาเลท สินค้า มีสถานะ RECEIVED,AUDITED,COUNTED,CONSOLIDATED,CANCELED จะput away by pass 
                        //var packList = sto.ToTreeList().FindAll(x => x.type == StorageObjectType.PACK);

                        packs.ForEach(pack =>
                        {
                            var disto = new amt_DocumentItemStorageObject
                            {
                                ID = null,
                                DocumentItem_ID = null,
                                Sou_StorageObject_ID = pack.id.Value,
                                Des_StorageObject_ID = pack.id.Value,
                                Quantity = pack.qty,
                                BaseQuantity = pack.baseQty,
                                UnitType_ID = pack.unitID,
                                BaseUnitType_ID = pack.baseUnitID,
                                Status = EntityStatus.INACTIVE
                            };

                            ADO.WMSDB.DistoADO.GetInstant().Insert(disto, BuVO);
                        });
                    }
                    else
                    {
                        throw new AMWException(Logger, AMWExceptionCode.V2002, "Can't receive Base Code '" + reqVO.baseCode + "' into ASRS because it has Event Status '" + sto.eventStatus + "'");
                    }
                }
                res = docItems;
            }

            return res;
        }

        public SPOutAreaLineCriteria GetDesLocations(StorageObjectCriteria sto, TReq reqVO)
        {
            SPOutAreaLineCriteria res = null;// this.ExectProject<TReqDocumentItemAndDISTO, SPOutAreaLineCriteria>(FeatureCode.EXEPJ_RegisterWorkQueue_GetDesLocations, new TReqDocumentItemAndDISTO() { sto = sto, reqVO = reqVO });
            if (res == null)
            {
                if (string.IsNullOrWhiteSpace(reqVO.desAreaCode))
                {
                    var desLocations = ADO.WMSDB.AreaADO.GetInstant().ListDestinationArea(reqVO.ioType, sto.areaID.Value, sto.parentID, this.BuVO);
                    res = desLocations.OrderByDescending(x => x.DefaultFlag).FirstOrDefault();
                }
                else
                {
                    var area = _areaASRS; //this.StaticValue.AreaMasters.FirstOrDefault(x => x.Code == reqVO.areaCode);
                    var desArea = this.StaticValue.AreaMasters.FirstOrDefault(x => x.Code == reqVO.desAreaCode);
                    var location = _locationASRS; // ADO.WMSDB.DataADO.GetInstant().SelectByCodeActive<ams_AreaLocationMaster>(reqVO.locationCode, this.BuVO);
                    var desLocation = ADO.WMSDB.DataADO.GetInstant().SelectByCodeActive<ams_AreaLocationMaster>(reqVO.desLocationCode, this.BuVO);
                    res = new SPOutAreaLineCriteria()
                    {
                        Sou_AreaMasterType_ID = area.AreaMasterType_ID,
                        //Sou_AreaMasterType_Code = this.StaticValue.AreaMasterTypes.FirstOrDefault(x => x.ID == area.AreaMasterType_ID).Code,
                        //Sou_AreaMasterType_GroupType = this.StaticValue.AreaMasterTypes.FirstOrDefault(x => x.ID == area.AreaMasterType_ID).groupType,
                        Sou_AreaMaster_ID = area.ID.Value,
                        Sou_AreaMaster_Code = area.Code,
                        Sou_AreaLocationMaster_ID = location.ID,
                        Sou_AreaLocationMaster_Code = location.Code,
                        Des_AreaMasterType_ID = desArea.AreaMasterType_ID,
                        //Des_AreaMasterType_Code = this.StaticValue.AreaMasterTypes.FirstOrDefault(x => x.ID == desArea.AreaMasterType_ID).Code,
                        //Des_AreaMasterType_GroupType = this.StaticValue.AreaMasterTypes.FirstOrDefault(x => x.ID == desArea.AreaMasterType_ID).groupType,
                        Des_AreaMaster_ID = desArea.ID.Value,
                        Des_AreaMaster_Code = reqVO.desAreaCode,
                        Des_AreaLocationMaster_ID = desLocation.ID,
                        Des_AreaLocationMaster_Code = reqVO.desLocationCode,
                        DefaultFlag = YesNoFlag.No,
                        Condition_Eval = null



                    };
                }
            }
            return res;
        }

        

        public void SetWeiChildAndUpdateInfoToChild(StorageObjectCriteria sto, decimal totalWeiKG)
        {
            var stoTreeList = sto.ToTreeList();
            var packMasters = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_PackMaster>(
                new SQLConditionCriteria(
                    "ID",
                    string.Join(',', stoTreeList.Where(x => x.type == StorageObjectType.PACK).Select(x => x.mstID.Value).Distinct().ToArray()),
                    SQLOperatorType.IN),
                this.BuVO);
            var baseMasters = ADO.WMSDB.DataADO.GetInstant().SelectByID<ams_BaseMaster>(stoTreeList.Where(x => x.type == StorageObjectType.BASE).FirstOrDefault().mstID.Value, this.BuVO);
            //*****SET WEI CODING

            sto.weiKG = totalWeiKG;
            var innerTotalWeiKG = (totalWeiKG - (baseMasters.WeightKG)) ?? 1;

            List<decimal> precenFromTotalWeis = new List<decimal>();
            decimal totalWeiStd = packMasters.Sum(x => (x.WeightKG ?? 0) * sto.mapstos.Where(y => y.type == StorageObjectType.PACK && y.mstID == x.ID).Sum(y => y.qty));
            totalWeiStd = totalWeiStd == 0 ? 1 : totalWeiStd;

            sto.mapstos.FindAll(x => x.type == StorageObjectType.PACK).ForEach(stos =>
            {
                decimal percentWeiStd =
                (
                    (packMasters.First(x => x.ID == stos.mstID).WeightKG ?? 1) * stos.qty
                ) / totalWeiStd;
                stos.weiKG = percentWeiStd * innerTotalWeiKG;
            });

            long areaID = sto.areaID.Value;
            stoTreeList.ForEach(x =>
            {
                x.areaID = areaID;
                ADO.WMSDB.StorageObjectADO.GetInstant().PutV2(x, BuVO);
            });

        }


        public SPworkQueue CreateWorkQueue(StorageObjectCriteria sto, List<amt_DocumentItem> docItems, SPOutAreaLineCriteria location, TReq reqVO)
        {
            SPworkQueue workQ = new SPworkQueue()
            {
                ID = null,
                IOType = reqVO.ioType,
                ActualTime = reqVO.actualTime,
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
                StartTime = reqVO.actualTime,

                DocumentItemWorkQueues = Common.ConverterModel.ToDocumentItemWorkQueue(docItems, sto)
            };
            workQ = ADO.WMSDB.WorkQueueADO.GetInstant().PUT(workQ, this.BuVO);
            return workQ;
        }

        public void InitDataASRS(TReq reqVO)
        {

            this._warehouseASRS = StaticValue.Warehouses.FirstOrDefault(x => x.Code == reqVO.warehouseCode);
            if (_warehouseASRS == null)
                throw new AMWException(Logger, AMWExceptionCode.V1001, "Warehouse Code '" + reqVO.warehouseCode + "' Not Found");
            this._branchASRS = StaticValue.Branchs.FirstOrDefault(x => x.ID == _warehouseASRS.Branch_ID);
            if (_branchASRS == null)
                throw new AMWException(Logger, AMWExceptionCode.V2001, "Branch Not Found");
            this._areaASRS = StaticValue.AreaMasters.FirstOrDefault(x => x.Code == reqVO.areaCode && x.Warehouse_ID == _warehouseASRS.ID);
            if (_areaASRS == null)
                throw new AMWException(Logger, AMWExceptionCode.V1001, "Area Code '" + reqVO.areaCode + "' Not Found");
            this._locationASRS = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>(
                new KeyValuePair<string, object>[] {
                    new KeyValuePair<string,object>("Code",reqVO.locationCode),
                    new KeyValuePair<string,object>("AreaMaster_ID",_areaASRS.ID.Value),
                    new KeyValuePair<string,object>("Status", EntityStatus.ACTIVE)
                }, this.BuVO).FirstOrDefault();
            if (_locationASRS == null)
                throw new AMWException(Logger, AMWExceptionCode.V1001, "Location Code '" + reqVO.locationCode + "' Not Found");
        }
        //BEGIN*******************ProcessReceiving***********************

        public List<amt_DocumentItem> ProcessPickingESP(StorageObjectCriteria mapsto, RegisterWorkQueue.TReq reqVO)
        {
            List<amt_DocumentItem> docItems = new List<amt_DocumentItem>();
            var souWarehouse = new ams_Warehouse();
            var souBranch = new ams_Branch();
            var desWarehouse = new ams_Warehouse();
            var desBranch = new ams_Branch();
            var desArea = new ams_AreaMaster();

            var psto = mapsto.ToTreeList().Find(x => x.type == StorageObjectType.PACK);
            ams_SKUMaster skuMaster = ADO.WMSDB.DataADO.GetInstant().SelectByID<ams_SKUMaster>((long)psto.skuID, BuVO);
            if (skuMaster == null)
                throw new AMWException(Logger, AMWExceptionCode.V2001, "SKU ID '" + (long)psto.skuID + "' Not Found");

            var skutype = StaticValue.SKUMasterTypes.Find(x => x.ID == skuMaster.SKUMasterType_ID);
            if (skutype == null)
                throw new AMWException(Logger, AMWExceptionCode.V1001, "ไม่พบข้อมูล SKU Master Type ในระบบ");
           
            if(skutype.GroupType != SKUGroupType.ESP)
                throw new AMWException(Logger, AMWExceptionCode.V1001, "สินค้าประเภท " + skutype.GroupType + "ไม่สามารถเบิกได้");

            ams_PackMaster packMaster = ADO.WMSDB.DataADO.GetInstant().SelectByID<ams_PackMaster>((long)psto.mstID, BuVO);
            if (packMaster == null)
                throw new AMWException(Logger, AMWExceptionCode.V2001, "PackMaster ID '" + (long)psto.mstID + "' Not Found");

            desWarehouse = StaticValue.Warehouses.FirstOrDefault(x => x.Code == reqVO.desWarehouseCode);
                if (desWarehouse == null)
                    throw new AMWException(Logger, AMWExceptionCode.V2001, "Warehouse " + reqVO.desWarehouseCode + " Not Found");
            desBranch = StaticValue.Branchs.FirstOrDefault(x => x.ID == desWarehouse.Branch_ID);
            if (desBranch == null)
                throw new AMWException(Logger, AMWExceptionCode.V2001, "Branch Not Found");
            desArea = StaticValue.AreaMasters.FirstOrDefault(x => x.Code == reqVO.desAreaCode);
            if (desArea == null)
                throw new AMWException(Logger, AMWExceptionCode.V2001, "Area " + reqVO.desAreaCode + " Not Found");

            var baseUnitTypeConvt = StaticValue.ConvertToBaseUnitBySKU(skuMaster.ID.Value, psto.qty, skuMaster.UnitType_ID.Value);
            decimal? baseQuantity = null;
            if (psto.qty >= 0)
                baseQuantity = baseUnitTypeConvt.newQty;

            long? forCus = string.IsNullOrWhiteSpace(reqVO.forCustomerCode) ?
                psto.forCustomerID != null ? psto.forCustomerID : null
                : StaticValue.Customers.First(x => x.Code == reqVO.forCustomerCode).ID;
            //auto create new Document 

            amt_DocumentItem docItemGR = new amt_DocumentItem()
            {
                Code = psto.code,
                SKUMaster_ID = psto.skuID.Value,
                PackMaster_ID = packMaster.ID.Value,

                Quantity = psto.qty,
                UnitType_ID = baseUnitTypeConvt.oldUnitType_ID,
                BaseQuantity = baseQuantity,
                BaseUnitType_ID = baseUnitTypeConvt.newUnitType_ID,
                EventStatus = DocumentEventStatus.NEW,
            };

            amt_Document docGR = new amt_Document()
            {
                For_Customer_ID = forCus,
                Sou_Branch_ID = _branchASRS.ID,
                Sou_Warehouse_ID = _warehouseASRS.ID,
                Sou_AreaMaster_ID = _areaASRS.ID,

                Des_Branch_ID = desBranch.ID,
                Des_Warehouse_ID = desWarehouse.ID,
                Des_AreaMaster_ID = desArea.ID,

                DocumentDate = DateTime.Now,
                ActionTime = DateTime.Now,
                DocumentProcessType_ID = DocumentProcessTypeID.ESP_TRANSFER_WM,

                DocumentType_ID = DocumentTypeID.GOODS_ISSUE,
                EventStatus = DocumentEventStatus.NEW,

                DocumentItems = new List<amt_DocumentItem> { docItemGR },

            };

            var docGRID = ADO.WMSDB.DocumentADO.GetInstant().Create(docGR, BuVO).ID;
            var _docGR = ADO.WMSDB.DocumentADO.GetInstant().GetDocumentAndDocItems(docGRID.Value, BuVO);

            amt_DocumentItem docItemPA = new amt_DocumentItem()
            { 
                Code = psto.code,
                ParentDocumentItem_ID = _docGR.DocumentItems[0].ID,
                SKUMaster_ID = psto.skuID.Value,
                PackMaster_ID = packMaster.ID.Value,
                Quantity = psto.qty,
                UnitType_ID = baseUnitTypeConvt.oldUnitType_ID,
                BaseQuantity = baseQuantity,
                BaseUnitType_ID = baseUnitTypeConvt.newUnitType_ID,
                EventStatus = DocumentEventStatus.NEW,
                DocItemStos = new List<amt_DocumentItemStorageObject>() { ConverterModel.ToDocumentItemStorageObject(psto, null, null, null) }
            };

            amt_Document docPA = new amt_Document()
            {
                ParentDocument_ID = docGRID,
                For_Customer_ID = forCus,
                Sou_Branch_ID = _branchASRS.ID,
                Sou_Warehouse_ID = _warehouseASRS.ID,
                Sou_AreaMaster_ID = _areaASRS.ID,

                Des_Branch_ID = desBranch.ID,
                Des_Warehouse_ID = desWarehouse.ID,
                Des_AreaMaster_ID = desArea.ID,

                DocumentDate = DateTime.Now,
                ActionTime = DateTime.Now,
                DocumentProcessType_ID = DocumentProcessTypeID.ESP_TRANSFER_WM,

                DocumentType_ID = DocumentTypeID.PICKING,
                EventStatus = DocumentEventStatus.NEW,

                DocumentItems = new List<amt_DocumentItem> { docItemPA },

            };

            var docPAID = ADO.WMSDB.DocumentADO.GetInstant().Create(docPA, BuVO).ID;
            docItems.AddRange(ADO.WMSDB.DocumentADO.GetInstant().ListItemAndDisto(docPAID.Value, BuVO));
            return docItems;
        }
    }



}