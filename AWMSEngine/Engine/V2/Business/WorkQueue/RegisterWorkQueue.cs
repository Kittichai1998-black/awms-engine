using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Request;
using AWMSModel.Criteria.SP.Response;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using AMWUtil.Exception;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.Common;
using AMWUtil.Logger;
using AWMSModel.Constant.StringConst;
using AWMSEngine.ADO.StaticValue;
using AWMSEngine.Engine.V2.General;

namespace AWMSEngine.Engine.V2.Business.WorkQueue
{
    public class RegisterWorkQueue : BaseQueue<RegisterWorkQueue.TReq, WorkQueueCriteria>
    {
        public class TReq //ข้อมูล Request จาก WCS
        {
            public string baseCode;//รหัสพาเลท
            public IOType ioType = IOType.INPUT;
            public decimal? weight;//น้ำหนัก Kg.
            public decimal? width;//กว้าง M.
            public decimal? length;//ยาว M.
            public decimal? height;//สูง M.
            public string warehouseCode;//รหัสคลังสินค้า
            public string areaCode;//รหัสโซน
            public string locationCode;//รหัสเกต
            public string desWarehouseCode;
            public string desAreaCode;
            public string desLocationCode;
            public string forCustomerCode;
            public DateTime actualTime;
            public List<PalletDataCriteriaV2> mappingPallets;
            public bool autoDoc = false;
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

        protected StorageObjectCriteria GetSto(TReq reqVO)
        {
            var res = this.ExectProject<TReq, StorageObjectCriteria>(FeatureCode.EXEPJ_RegisterWorkQueue_GetSTO, reqVO);
            if (res == null)
            {
                ////DF Code

                var sto = ADO.StorageObjectADO.GetInstant().Get(reqVO.baseCode,
                    null, null, false, true, BuVO);

                // add by ple
                if (sto == null)

                {
                    if (reqVO.mappingPallets != null && reqVO.mappingPallets.Count > 0)
                    {
                        sto = this.CreateSto(reqVO);
                    }
                    else
                    {
                        throw new AMWException(Logger, AMWExceptionCode.V1001, "Data of mappingPallets Not Found");
                    }
                }
                else
                {
                    if (reqVO.mappingPallets != null && reqVO.mappingPallets.Count > 0)
                    {
                        var stopacks = sto.ToTreeList().Where(x => x.type == StorageObjectType.PACK).ToList();
                        if (stopacks == null || stopacks.Count == 0)
                        {
                            ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(sto.id.Value, StorageObjectEventStatus.NEW, null, StorageObjectEventStatus.REMOVED, this.BuVO);

                            sto = this.CreateSto(reqVO);
                        }
                    }
                }
                // end
                //if (sto == null)
                //    throw new AMWException(Logger, AMWExceptionCode.V1001, "Storage Object of Base Code: '" + reqVO.baseCode + "' Not Found");
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

                res = sto;
            }
            return res;
        }
        protected StorageObjectCriteria CreateSto(TReq reqVO)
        {
            StorageObjectCriteria newSto = new StorageObjectCriteria();
            bool checkEmpPallet = false;
            long? idBaseSto = null;

            checkEmpPallet = StaticValueManager.GetInstant().SKUMasterEmptyPallets.Any(x => x.Code == reqVO.mappingPallets[0].code);
            var _warehouse = StaticValueManager.GetInstant().Warehouses.FirstOrDefault(x => x.Code == reqVO.warehouseCode);
            var _area = StaticValueManager.GetInstant().AreaMasters.FirstOrDefault(x => x.Code == reqVO.areaCode);

            var req_NewBase = new MappingNewBaseAndSTO.TReq()
            {
                baseCode = reqVO.baseCode,
                isEmptyPallet = true,
                warehouseID = _warehouse.ID.Value,
                areaID = _area.ID,
                weight = reqVO.weight,
                length = reqVO.length,
                height = reqVO.height,
                width = reqVO.width
            };
            var newbase = new MappingNewBaseAndSTO().Execute(this.Logger, this.BuVO, req_NewBase); ;
            idBaseSto = newbase.id;

            reqVO.mappingPallets.ForEach((mappingPallets) =>
            {

                var Sku = AWMSEngine.ADO.DataADO.GetInstant().SelectByCodeActive<ams_SKUMaster>(mappingPallets.code, BuVO);
                var unitID = StaticValueManager.GetInstant().UnitTypes.Find(x => x.Code == mappingPallets.unit).ID;
                var PackMasterEmptyPallets = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<ams_PackMaster>(
                    new SQLConditionCriteria[] {
                new SQLConditionCriteria("SKUMaster_ID",Sku.ID, SQLOperatorType.EQUALS),
                new SQLConditionCriteria("UnitType_ID",unitID, SQLOperatorType.EQUALS),
                new SQLConditionCriteria("Status",EntityStatus.ACTIVE, SQLOperatorType.EQUALS),
                }, this.BuVO).FirstOrDefault();
                if (PackMasterEmptyPallets == null)
                    throw new AMWException(Logger, AMWExceptionCode.V1001, "Pack : " + mappingPallets.code + " Not Found.");

                // var PackMasterEmptyPallets = StaticValueManager.GetInstant().SKUMasterEmptyPallets.FirstOrDefault();
                var unit = StaticValueManager.GetInstant().UnitTypes.FirstOrDefault(x => x.ID == PackMasterEmptyPallets.UnitType_ID);
                var _objSizePack = StaticValueManager.GetInstant().ObjectSizes.Find(x => x.ID == PackMasterEmptyPallets.ObjectSize_ID);


                StorageObjectCriteria packSto = new StorageObjectCriteria()
                {
                    parentID = idBaseSto,
                    parentType = StorageObjectType.BASE,
                    code = Sku.Code,
                    eventStatus = StorageObjectEventStatus.NEW,
                    name = PackMasterEmptyPallets.Name,
                    qty = Convert.ToDecimal(mappingPallets.qty),
                    skuID = PackMasterEmptyPallets.SKUMaster_ID,
                    unitCode = unit.Code,
                    unitID = unit.ID.Value,
                    baseUnitCode = unit.Code,
                    baseUnitID = unit.ID.Value,
                    baseQty = Convert.ToDecimal(mappingPallets.qty),
                    type = StorageObjectType.PACK,
                    mstID = PackMasterEmptyPallets.ID.Value,
                    options = mappingPallets.options,
                    areaID = StaticValueManager.GetInstant().AreaMasters.FirstOrDefault(x => x.Code == reqVO.areaCode).ID.Value,
                };

                AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(packSto, BuVO);


            });
            
            newSto = ADO.StorageObjectADO.GetInstant().Get(idBaseSto.Value, StorageObjectType.BASE, false, true, BuVO);



            return newSto;
        }
        protected List<amt_DocumentItem> GetDocumentItemAndDISTO(StorageObjectCriteria sto, TReq reqVO)
        {
            var res = this.ExectProject<TReqDocumentItemAndDISTO, List<amt_DocumentItem>>(FeatureCode.EXEPJ_RegisterWorkQueue_GetDocumentItemAndDISTO, new TReqDocumentItemAndDISTO() { sto = sto, reqVO = reqVO });
            if (res == null)
            {
                var pack = sto.ToTreeList().FindAll(x => x.type == StorageObjectType.PACK);
                ////DF Code
                List<amt_DocumentItem> docItems = new List<amt_DocumentItem>();
                //รับสินค้าใหม่เข้าคลัง, รับเข้าpallet เปล่า, สร้างเอกสารเบิกpallet เปล่า, 
                if (pack.TrueForAll(sto => sto.eventStatus == StorageObjectEventStatus.NEW))
                {
                    var pstoLists = sto.ToTreeList().Where(x => x.type == StorageObjectType.PACK).ToList();
                    if (pstoLists == null || pstoLists.Count() == 0)
                        throw new AMWException(Logger, AMWExceptionCode.V2001, "Data of Packs Not Found");

                    if (reqVO.ioType == IOType.OUTPUT)
                    {
                        //get Document
                        var docItemLists = ADO.DocumentADO.GetInstant().ListItemBySTO(pstoLists.Select(x => x.id.Value).ToList(),
                            DocumentTypeID.GOODS_ISSUED, BuVO);
                        if (docItemLists == null || docItemLists.Count == 0)
                        {
                            docItems = this.ProcessReceiving(sto, reqVO);
                        }
                        else
                        {
                            docItemLists.ForEach(di =>
                            {
                                docItems.Add(ADO.DocumentADO.GetInstant().GetItemAndStoInDocItem(di.ID.Value, BuVO));
                            });
                        }
                    }
                    else
                    {
                        var _autodoc = ObjectUtil.QryStrGetValue(sto.options, OptionVOConst.OPT_AUTO_DOC);
                        if (_autodoc == "true")
                        {
                            docItems = this.ProcessReceiving(sto, reqVO);
                        }
                        else
                        {
                            pstoLists.ForEach(psto =>
                            {
                                var _docitem_id = ObjectUtil.QryStrGetValue(psto.options, OptionVOConst.OPT_DOCITEM_ID);
                                if (!string.IsNullOrWhiteSpace(_docitem_id) || _docitem_id.Length > 0)
                                {
                                    var docItem = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<amt_DocumentItem>(Convert.ToInt32(_docitem_id), BuVO);
                                    if (docItem == null)
                                        throw new AMWException(Logger, AMWExceptionCode.V1001, "Document of " + reqVO.baseCode + " Not Found.");

                                    docItem.DocItemStos = new List<amt_DocumentItemStorageObject>() { ConverterModel.ToDocumentItemStorageObject(psto, null, null, docItem.ID.Value) };
                                    AWMSEngine.ADO.DocumentADO.GetInstant().InsertMappingSTO(docItem.DocItemStos, BuVO);
                                    //docItems.Add(docItem);

                                }
                                else
                                {
                                  
                                   throw new AMWException(Logger, AMWExceptionCode.V2001, "Option of DOCITEM_ID Not Found");
                                }
                            });


                            //get Document
                            var docItemLists = ADO.DocumentADO.GetInstant().ListItemBySTO(pstoLists.Select(x => x.id.Value).ToList(),
                                DocumentTypeID.GOODS_RECEIVED, BuVO);

                            docItemLists.ForEach(di =>
                            {
                                docItems.Add(ADO.DocumentADO.GetInstant().GetItemAndStoInDocItem(di.ID.Value, BuVO));
                            });

                        }
                    }

                    if (docItems == null || docItems.Count == 0)
                        throw new AMWException(Logger, AMWExceptionCode.V2001, "Good Received Document Not Found");
                }
                else if (pack.TrueForAll(sto => sto.eventStatus.Attribute<StorageObjectEventStatusAttr>() != null && sto.eventStatus.Attribute<StorageObjectEventStatusAttr>().IsPutawayBypassASRS ))
                {
                    //ถ้าพาเลท สินค้า มีสถานะ RECEIVED,AUDITED,COUNTED,CONSOLIDATED,CANCELED จะput away by pass 
                    var packList = sto.ToTreeList().FindAll(x => x.type == StorageObjectType.PACK);
                     
                    packList.ForEach(pack =>
                    {
                        var disto = new amt_DocumentItemStorageObject
                        {
                            ID = null,
                            DocumentItem_ID = null,
                            Sou_StorageObject_ID = pack.id.Value,
                            Des_StorageObject_ID = pack.id.Value,
                            Quantity = 0,
                            BaseQuantity = 0,
                            UnitType_ID = pack.unitID,
                            BaseUnitType_ID = pack.baseUnitID,
                            Status = EntityStatus.ACTIVE
                        };

                        AWMSEngine.ADO.DocumentADO.GetInstant().InsertMappingSTO(disto, BuVO);
                    });
                }
                else
                {
                    throw new AMWException(Logger, AMWExceptionCode.V2002, "Can't receive Base Code '" + reqVO.baseCode + "' into ASRS because it has Event Status '" + sto.eventStatus + "'");
                }

                res = docItems;
            }

            return res;
        }

        protected SPOutAreaLineCriteria GetDesLocations(StorageObjectCriteria sto, TReq reqVO)
        {
            SPOutAreaLineCriteria res = this.ExectProject<TReqDocumentItemAndDISTO, SPOutAreaLineCriteria>(FeatureCode.EXEPJ_RegisterWorkQueue_GetDesLocations, new TReqDocumentItemAndDISTO() { sto = sto, reqVO = reqVO });
            if (res == null)
            {
                if (string.IsNullOrWhiteSpace(reqVO.desAreaCode))
                {
                    var desLocations = ADO.AreaADO.GetInstant().ListDestinationArea(reqVO.ioType, sto.areaID.Value, sto.parentID, this.BuVO);
                    res = desLocations.OrderByDescending(x => x.DefaultFlag).FirstOrDefault();
                }
                else
                {
                    var area = _areaASRS; //this.StaticValue.AreaMasters.FirstOrDefault(x => x.Code == reqVO.areaCode);
                    var desArea = this.StaticValue.AreaMasters.FirstOrDefault(x => x.Code == reqVO.desAreaCode);
                    var location = _locationASRS; // ADO.DataADO.GetInstant().SelectByCodeActive<ams_AreaLocationMaster>(reqVO.locationCode, this.BuVO);
                    var desLocation = ADO.DataADO.GetInstant().SelectByCodeActive<ams_AreaLocationMaster>(reqVO.desLocationCode, this.BuVO);
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

        protected override WorkQueueCriteria ExecuteEngine(TReq reqVO)
        {
            this.InitDataASRS(reqVO);

            var sto = GetSto(reqVO);
            if (sto != null)
            {
                this.SetWeiChildAndUpdateInfoToChild(sto, reqVO.weight ?? 0);
                this.ValidateObjectSizeLimit(sto);
                var docItem = GetDocumentItemAndDISTO(sto, reqVO);
                var desLocation = this.GetDesLocations(sto, reqVO);
                var queueTrx = this.CreateWorkQueue(sto, docItem, desLocation, reqVO);
                if (queueTrx.IOType == IOType.OUTPUT)
                {
                    ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(sto.id.Value, null,
                    StaticValueManager.GetInstant().GetStatusInConfigByEventStatus<StorageObjectEventStatus>(sto.eventStatus),
                    StorageObjectEventStatus.PICKING, this.BuVO);
                }
                else
                {
                    if (sto.eventStatus == StorageObjectEventStatus.NEW)
                        ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(sto.id.Value, null,
                        StaticValueManager.GetInstant().GetStatusInConfigByEventStatus<StorageObjectEventStatus>(sto.eventStatus),
                        StorageObjectEventStatus.RECEIVING, this.BuVO);
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
                                AWMSEngine.ADO.DocumentADO.GetInstant().UpdateMappingSTO(disto.ID.Value, queueTrx.ID.Value, EntityStatus.INACTIVE, this.BuVO);
                            else
                                AWMSEngine.ADO.DocumentADO.GetInstant().UpdateMappingSTO(disto.ID.Value, queueTrx.ID.Value, EntityStatus.ACTIVE, this.BuVO);
                        });
                    });


                    var docIDs = docItem.Select(x => x.Document_ID).Distinct().ToList();
                    docIDs.ForEach(x =>
                    {
                        ADO.DocumentADO.GetInstant().UpdateStatusToChild(x, DocumentEventStatus.NEW, null, DocumentEventStatus.WORKING, this.BuVO);
                    });
                }
                else
                {
                    var stoPack = sto.ToTreeList().FindAll(x => x.type == StorageObjectType.PACK).FirstOrDefault();
                    var getDisto = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(new SQLConditionCriteria[]
                        {
                            new SQLConditionCriteria("Sou_StorageObject_ID", stoPack.id, SQLOperatorType.EQUALS),
                            new SQLConditionCriteria("Status", EntityStatus.INACTIVE, SQLOperatorType.EQUALS),
                        }, this.BuVO).FirstOrDefault(x => x.DocumentItem_ID == null);

                    ADO.DocumentADO.GetInstant().UpdateMappingSTO(getDisto.ID.Value, queueTrx.ID.Value, EntityStatus.INACTIVE, this.BuVO);
                }

                return this.GenerateResponse(sto, queueTrx);
            }
            else
            {
                throw new Exception("Sto Invalid");
            }
        }


        public void SetWeiChildAndUpdateInfoToChild(StorageObjectCriteria sto, decimal totalWeiKG)
        {
            var stoTreeList = sto.ToTreeList();
            var packMasters = ADO.DataADO.GetInstant().SelectBy<ams_PackMaster>(
                new SQLConditionCriteria(
                    "ID",
                    string.Join(',', stoTreeList.Where(x => x.type == StorageObjectType.PACK).Select(x => x.mstID.Value).Distinct().ToArray()),
                    SQLOperatorType.IN),
                this.BuVO);
            var baseMasters = ADO.DataADO.GetInstant().SelectByID<ams_BaseMaster>(stoTreeList.Where(x => x.type == StorageObjectType.BASE).FirstOrDefault().mstID.Value, this.BuVO);
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
                ADO.StorageObjectADO.GetInstant().PutV2(x, BuVO);
            });

        }


        private SPworkQueue CreateWorkQueue(StorageObjectCriteria sto, List<amt_DocumentItem> docItems, SPOutAreaLineCriteria location, TReq reqVO)
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
            workQ = ADO.WorkQueueADO.GetInstant().PUT(workQ, this.BuVO);
            return workQ;
        }

        private void InitDataASRS(TReq reqVO)
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
            this._locationASRS = ADO.DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>(
                new KeyValuePair<string, object>[] {
                    new KeyValuePair<string,object>("Code",reqVO.locationCode),
                    new KeyValuePair<string,object>("AreaMaster_ID",_areaASRS.ID.Value),
                    new KeyValuePair<string,object>("Status", EntityStatus.ACTIVE)
                }, this.BuVO).FirstOrDefault();
            if (_locationASRS == null)
                throw new AMWException(Logger, AMWExceptionCode.V1001, "Location Code '" + reqVO.locationCode + "' Not Found");
        }
        //BEGIN*******************ProcessReceiving***********************

        private List<amt_DocumentItem> ProcessReceiving(StorageObjectCriteria mapsto, RegisterWorkQueue.TReq reqVO)
        {
            List<amt_DocumentItem> docItems = new List<amt_DocumentItem>();
            var souWarehouse = new ams_Warehouse();
            var souBranch = new ams_Branch();
            var desWarehouse = new ams_Warehouse();
            var desBranch = new ams_Branch();
            var desArea = new ams_AreaMaster();

            DocumentTypeID documentTypeID = new DocumentTypeID();
            var pstoLists = mapsto.ToTreeList().Where(x => x.type == StorageObjectType.PACK).ToList();
            if (pstoLists == null || pstoLists.Count() == 0)
                throw new AMWException(Logger, AMWExceptionCode.V2001, "Data of Packs Not Found");

            var mvt = ObjectUtil.QryStrGetValue(mapsto.options, OptionVOConst.OPT_MVT);
            DocumentProcessTypeID mvtDoc = new DocumentProcessTypeID();
            if (mvt != null && mvt.Length > 0)
            {
                mvtDoc = (DocumentProcessTypeID)Enum.Parse(typeof(DocumentProcessTypeID), mvt);
            }

            //auto create new Document 
            if (reqVO.ioType == IOType.INPUT)
            {
                documentTypeID = DocumentTypeID.GOODS_RECEIVED;
                //souWarehouse = _warehouseASRS;
                //souBranch = _branchASRS;
            }
            else
            {
                documentTypeID = DocumentTypeID.GOODS_ISSUED;

                desWarehouse = StaticValue.Warehouses.FirstOrDefault(x => x.Code == reqVO.desWarehouseCode);
                if (desWarehouse == null)
                    throw new AMWException(Logger, AMWExceptionCode.V2001, "Warehouse " + reqVO.desWarehouseCode + " Not Found");
                desBranch = StaticValue.Branchs.FirstOrDefault(x => x.ID == desWarehouse.Branch_ID);
                if (desBranch == null)
                    throw new AMWException(Logger, AMWExceptionCode.V2001, "Branch Not Found");
                desArea = StaticValue.AreaMasters.FirstOrDefault(x => x.Code == reqVO.desAreaCode);
                if (desArea == null)
                    throw new AMWException(Logger, AMWExceptionCode.V2001, "Area " + reqVO.desAreaCode + " Not Found");
            }
            List<TempMVTDocItems> tempDocItems = new List<TempMVTDocItems>();

            foreach (var psto in pstoLists)
            {
                ams_SKUMaster skuMaster = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<ams_SKUMaster>((long)psto.skuID, BuVO);
                if (skuMaster == null)
                    throw new AMWException(Logger, AMWExceptionCode.V2001, "SKU ID '" + (long)psto.skuID + "' Not Found");
                ams_PackMaster packMaster = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<ams_PackMaster>((long)psto.mstID, BuVO);
                if (packMaster == null)
                    throw new AMWException(Logger, AMWExceptionCode.V2001, "PackMaster ID '" + (long)psto.mstID + "' Not Found");

                var sto_skuType = StaticValue.SKUMasterTypes.Find(x => x.ID == skuMaster.SKUMasterType_ID);
                var skutypeg = sto_skuType.GroupType.GetValueInt();
                if (mvt == null || mvt.Length == 0)
                {
                    var movementtype = sto_skuType.GroupType.GetValueInt().ToString() + "011";
                    mvtDoc = (DocumentProcessTypeID)Enum.Parse(typeof(DocumentProcessTypeID), movementtype);
                    if (mvtDoc.Equals(null))
                    {
                        throw new AMWException(Logger, AMWExceptionCode.V2001, "Movement Type isn't match.");
                    }
                }
                var parentDocID_opt = ObjectUtil.QryStrGetValue(psto.options, OptionVOConst.OPT_PARENT_DOCUMENT_ID);

                var baseUnitTypeConvt = StaticValue.ConvertToBaseUnitBySKU(skuMaster.ID.Value, psto.qty, skuMaster.UnitType_ID.Value);
                decimal? baseQuantity = null;
                if (psto.qty >= 0)
                    baseQuantity = baseUnitTypeConvt.baseQty;

                tempDocItems.Add(new TempMVTDocItems()
                {
                    processID = mvtDoc,
                    parentDocID = string.IsNullOrWhiteSpace(parentDocID_opt) ? 0 : long.Parse(parentDocID_opt),
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
                        ExpireDate = psto.expiryDate,
                        ProductionDate = psto.productDate,
                        Ref1 = null,
                        Ref2 = null,
                        RefID = null,

                        EventStatus = DocumentEventStatus.NEW,
                        DocItemStos = new List<amt_DocumentItemStorageObject>() { ConverterModel.ToDocumentItemStorageObject(psto, null, null, null) }
                    }
                });

            }

            var res_DI = tempDocItems.GroupBy(
                p => new { p.processID, p.parentDocID }, (key, g) => new { MVTCode = key.processID, ParentDocID = key.parentDocID, DocItems = g.Select(y => y.docItem).ToList() });
            foreach (var di in res_DI)
            {
                amt_Document doc = new amt_Document()
                {
                    ID = null,
                    Code = null,
                    ParentDocument_ID = di.ParentDocID == 0 ? null : di.ParentDocID,
               
                    For_Customer_ID = string.IsNullOrWhiteSpace(reqVO.forCustomerCode) ? null : StaticValue.Customers.First(x => x.Code == reqVO.forCustomerCode).ID,
                    Sou_Customer_ID = null,
                    Sou_Supplier_ID = null,
                    Sou_Branch_ID = _branchASRS.ID,
                    Sou_Warehouse_ID = _warehouseASRS.ID,
                    Sou_AreaMaster_ID = reqVO.ioType == IOType.INPUT ? null : _areaASRS.ID,

                    Des_Customer_ID = null,
                    Des_Supplier_ID = null,
                    Des_Branch_ID = reqVO.ioType == IOType.INPUT ? _branchASRS.ID : desBranch.ID,
                    Des_Warehouse_ID = reqVO.ioType == IOType.INPUT ? _warehouseASRS.ID : desWarehouse.ID,
                    Des_AreaMaster_ID = reqVO.ioType == IOType.INPUT ? null : desArea.ID,

                    DocumentDate = DateTime.Now,
                    ActionTime = DateTime.Now,
                    DocumentProcessType_ID = di.MVTCode,
                    RefID = null,
                    Ref1 = null,
                    Ref2 = null,

                    DocumentType_ID = documentTypeID,
                    EventStatus = DocumentEventStatus.NEW,

                    Remark = null,
                    Options = null,
                    Transport_ID = null,

                    DocumentItems = di.DocItems,

                };

                var docID = AWMSEngine.ADO.DocumentADO.GetInstant().Create(doc, BuVO).ID;
                docItems.AddRange(AWMSEngine.ADO.DocumentADO.GetInstant().ListItemAndDisto(docID.Value, BuVO));

            }


            return docItems;
        }
    }



}