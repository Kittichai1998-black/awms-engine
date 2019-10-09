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

        protected StorageObjectCriteria GetSto(TReq reqVO)
        {
            var res = this.ExectProject<TReq, StorageObjectCriteria>(FeatureCode.EXEPJ_RegisterWorkQueue_GetSTO, reqVO);
            if(res == null)
            {
                ////DF Code
                var sto = ADO.StorageObjectADO.GetInstant().Get(reqVO.baseCode,
                    null, null, false, true, BuVO);
                if (sto == null)
                    throw new AMWException(Logger, AMWExceptionCode.V1001, "Storage Object of Base Code: '" + reqVO.baseCode + "' Not Found");
                if (sto.code != reqVO.baseCode)
                    throw new AMWException(Logger, AMWExceptionCode.V1001, "Base Code: '" + reqVO.baseCode + "' INCORRECT");
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
        protected List<amt_DocumentItem> GetDocumentItemAndDISTO(StorageObjectCriteria sto, TReq reqVO)
        {
            var res = this.ExectProject<TReqDocumentItemAndDISTO, List<amt_DocumentItem>>(FeatureCode.EXEPJ_RegisterWorkQueue_GetDocumentItemAndDISTO, new TReqDocumentItemAndDISTO() { sto = sto, reqVO = reqVO });
            if (res == null)
            {
                ////DF Code
                List<amt_DocumentItem> docItems = new List<amt_DocumentItem>();
                //รับสินค้าใหม่เข้าคลัง, รับเข้าpallet เปล่า, สร้างเอกสารเบิกpallet เปล่า, 
                if (sto.eventStatus == StorageObjectEventStatus.NEW)
                {
                    docItems = this.ProcessReceiving(sto, reqVO);

                    if (docItems.Count() == 0)
                        throw new AMWException(Logger, AMWExceptionCode.V2001, "Good Received Document Not Found");
                }
                //return picking
                else if (sto.eventStatus == StorageObjectEventStatus.RECEIVED)
                {

                    var stoEmp = sto.ToTreeList().Find(x => x.type == StorageObjectType.PACK);
                    var skuMaster = ADO.DataADO.GetInstant().SelectByID<ams_SKUMaster>(stoEmp.skuID.Value, BuVO);
                    if (skuMaster == null)
                        throw new AMWException(Logger, AMWExceptionCode.V2001, "SKU ID '" + (long)sto.skuID + "' Not Found");
                    var SKUMasterType = ADO.StaticValue.StaticValueManager.GetInstant().SKUMasterTypes.Find(x => x.ID == skuMaster.SKUMasterType_ID);
                    if (SKUMasterType.GroupType == SKUGroupType.EMP)
                    {
                        docItems = this.ProcessReceiving(sto, reqVO);

                        if (docItems.Count() == 0)
                            throw new AMWException(Logger, AMWExceptionCode.V2001, "Good Received Document Not Found");

                    }
                }
                else if (sto.eventStatus == StorageObjectEventStatus.AUDITING || sto.eventStatus == StorageObjectEventStatus.AUDITED)
                {
                    var packList = sto.ToTreeList().FindAll(x => x.type == StorageObjectType.PACK);
                    var disto = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
                        new SQLConditionCriteria[] {
                        new SQLConditionCriteria("Sou_StorageObject_ID", string.Join(",", packList.Select(y=>y.id).ToArray()), SQLOperatorType.IN ),
                        new SQLConditionCriteria("DocumentType_ID", DocumentTypeID.AUDIT, SQLOperatorType.EQUALS )
                        }, BuVO);
                    if (!disto.TrueForAll(x => x.Status == EntityStatus.ACTIVE))
                    {
                        throw new AMWException(Logger, AMWExceptionCode.V2002, "Can't receive Base Code '" + reqVO.baseCode + "' into ASRS because it isn't to Audit, yet.");
                    }
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
                        Sou_AreaMasterType_ID = this.StaticValue.AreaMasterTypes.FirstOrDefault(x => x.ID == area.AreaMasterType_ID).ID,
                        Sou_AreaMasterType_Code = this.StaticValue.AreaMasterTypes.FirstOrDefault(x => x.ID == area.AreaMasterType_ID).Code,
                        Sou_AreaMasterType_GroupType = this.StaticValue.AreaMasterTypes.FirstOrDefault(x => x.ID == area.AreaMasterType_ID).groupType,
                        Sou_AreaMaster_ID = area.ID.Value,
                        Sou_AreaMaster_Code = area.Code,
                        Sou_AreaLocationMaster_ID = location.ID,
                        Sou_AreaLocationMaster_Code = location.Code,
                        Des_AreaMasterType_ID = this.StaticValue.AreaMasterTypes.FirstOrDefault(x => x.ID == desArea.AreaMasterType_ID).ID,
                        Des_AreaMasterType_Code = this.StaticValue.AreaMasterTypes.FirstOrDefault(x => x.ID == desArea.AreaMasterType_ID).Code,
                        Des_AreaMasterType_GroupType = this.StaticValue.AreaMasterTypes.FirstOrDefault(x => x.ID == desArea.AreaMasterType_ID).groupType,
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
                this.SetWeiChildAndUpdateInfoToChild(sto, reqVO.weight ?? 0 );
                this.ValidateObjectSizeLimit(sto);
                var docItem = GetDocumentItemAndDISTO(sto, reqVO);
                var desLocation = this.GetDesLocations(sto, reqVO);
                var queueTrx = this.CreateWorkQueue(sto, docItem, desLocation, reqVO);
                ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(sto.id.Value, null, null, StorageObjectEventStatus.RECEIVING, this.BuVO);
               
                if(docItem.Count > 0)
                {
                    docItem.ForEach(x =>
                    {
                        x.DocItemStos.ForEach(disto =>
                        {
                            disto.WorkQueue_ID = queueTrx.ID.Value;
                            if(disto.Status == EntityStatus.INACTIVE)
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
            else {
                throw new Exception( "Sto Invalid");
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
            var innerTotalWeiKG = (totalWeiKG - (baseMasters.WeightKG))??1;

            List<decimal> precenFromTotalWeis = new List<decimal>();
            decimal totalWeiStd = packMasters.Sum(x =>(x.WeightKG ?? 0) *sto.mapstos.Where(y => y.type == StorageObjectType.PACK && y.mstID == x.ID).Sum(y => y.qty));
            totalWeiStd = totalWeiStd==0?1:totalWeiStd;

            sto.mapstos.FindAll(x => x.type == StorageObjectType.PACK).ForEach(stos =>
            {
                decimal percentWeiStd =
                (
                    packMasters.First(x => x.ID == stos.mstID).WeightKG??1 *
                    sto.qty
                )  /totalWeiStd;
                sto.weiKG = percentWeiStd * innerTotalWeiKG;
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
            var desWarehouse = new ams_Warehouse();
            var desBranch = new ams_Branch();
            var desArea = new ams_AreaMaster();
            if (reqVO.ioType == IOType.OUTPUT)
            {
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

            var _autodoc = ObjectUtil.QryStrGetValue(mapsto.options, OptionVOConst.OPT_AUTO_DOC);
            var pstos = mapsto.ToTreeList().Where(x => x.type == StorageObjectType.PACK).ToList();
            if (pstos == null || pstos.Count() == 0)
                throw new AMWException(Logger, AMWExceptionCode.V2001, "Data of Packs Not Found");
            var sto_skuType = StaticValue.SKUMasterTypes.Find(x=>x.ID == pstos.First().skuID.Value);


            if (_autodoc == "true")
            {
                //auto create new Document 

            }
            else
            {
                //get Document
                docItems = ADO.DocumentADO.GetInstant().ListItemBySTO(pstos.Select(x=>x.id.Value).ToList(), BuVO);
            }

            

            return docItems;
        }
    }

   

}
