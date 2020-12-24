using ADO.WMSStaticValue;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.Received
{
    public class MappingPalletToLocation : BaseEngine<MappingPalletToLocation.TReq, MappingPalletToLocation.TRes>
    {
        public class TReq
        {
            public string baseCode;
            public string warehouseCode;
            public string areaCode;
            public string locationCode;
        }

        public class TRes
        {
            public bool recievedStatus;
        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var result = new TRes();
            var warehouse = this.StaticValue.Warehouses.FirstOrDefault(x => x.Code == reqVO.warehouseCode);
            if (warehouse == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Warehouse นี้ในระบบ");
            var area = this.StaticValue.AreaMasters.FirstOrDefault(x => x.Code == reqVO.areaCode);
            if(area == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Area นี้ในระบบ");

            var location = ADO.WMSDB.DataADO.GetInstant().SelectByCodeActive<ams_AreaLocationMaster>(reqVO.locationCode, this.BuVO);
            if (location == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Location นี้ในระบบ");

            //var stoLoc = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_StorageObject>(new SQLConditionCriteria[]{
            //    new SQLConditionCriteria("AreaLocationMaster_ID", location.ID, SQLOperatorType.EQUALS),
            //    new SQLConditionCriteria("AreaMaster_ID", area.ID, SQLOperatorType.EQUALS),
            //    new SQLConditionCriteria("Status", new int[]{ 0,1 }, SQLOperatorType.IN),
            //}, this.BuVO);

            var stoPallet = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_StorageObject>(new SQLConditionCriteria[]{
                new SQLConditionCriteria("Code", reqVO.baseCode, SQLOperatorType.EQUALS),
                new SQLConditionCriteria("Status", new int[]{ 0,1 }, SQLOperatorType.IN),
                new SQLConditionCriteria("ObjectType", StorageObjectType.BASE, SQLOperatorType.EQUALS),
            }, this.BuVO).FirstOrDefault();
            
            if (stoPallet != null)
            {
                var areaSto = this.StaticValue.AreaMasters.FirstOrDefault(x => x.ID == stoPallet.AreaMaster_ID);
                if (areaSto.AreaMasterType_ID == AreaMasterTypeID.STO_ASRS)
                    throw new AMWException(this.Logger, AMWExceptionCode.B0001, "ไม่สามารถย้ายสินค้าในคลังสินค้าได้");

                if(stoPallet.AreaLocationMaster_ID != location.ID)
                {
                    var baseSto = ADO.WMSDB.StorageObjectADO.GetInstant().Get(stoPallet.ID.Value, StorageObjectType.BASE, false, true, BuVO);
                    ADO.WMSDB.StorageObjectADO.GetInstant().UpdateLocationToChild(baseSto, location.ID.Value, BuVO);
                }
                result.recievedStatus = true;
            }
            else
            {
                var findItems = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_DocumentItem>(new SQLConditionCriteria[]
                {
                    new SQLConditionCriteria("BaseCode", reqVO.baseCode, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("EventStatus", DocumentEventStatus.NEW, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("ParentDocumentItem_ID", "", SQLOperatorType.ISNOTNULL),
                }, BuVO);

                if(findItems.Count == 0)
                    throw new AMWException(this.Logger, AMWExceptionCode.B0001, "ไม่พบเอกสารรับเข้า");
                else
                {
                    //if(findItems.Select(x=> x.Document_ID).Count() > 1)
                    //throw new AMWException(this.Logger, AMWExceptionCode.B0001, "พบเอกสารมากกว่า 1 เอกสาร");

                    var selectDoc = findItems.Select(x => x.Document_ID).Distinct().Select(x => {
                        return ADO.WMSDB.DocumentADO.GetInstant().Get(x, BuVO);
                    }).ToList().FindAll(x=> x.DocumentType_ID == DocumentTypeID.PUTAWAY && x.Status == EntityStatus.ACTIVE).ToList();

                    if(selectDoc.Count == 0)
                        throw new AMWException(this.Logger, AMWExceptionCode.B0001, "ไม่ใช่พบเอกสารรับเข้า ไม่สามารถรับเข้าได้");

                    selectDoc.ForEach(x =>
                    {
                        var chkArea = StaticValue.AreaRoutes.Find(y => y.Sou_AreaMaster_ID == area.ID && y.Des_AreaMaster_ID == x.Des_AreaMaster_ID);
                        if(chkArea == null)
                            throw new AMWException(this.Logger, AMWExceptionCode.B0001, "วางสินค้าไม่ถูกตำแหน่ง ไม่พบเอกสารรับเข้าสินค้าจากตำแหน่งนี้");
                    });

                    var scanMap = new ScanMapStoNoDoc();

                    var createPalletData = new ScanMapStoNoDoc.TReq()
                    {
                        rootID = null,
                        scanCode = reqVO.baseCode,
                        warehouseID = warehouse.ID,
                        areaID = area.ID,
                        mode = VirtualMapSTOModeType.REGISTER,
                        action = VirtualMapSTOActionType.ADD,
                        amount = 1,
                        locationCode = location.Code,
                        batch = "",
                        isRoot = true,
                        lot = "",
                        options = "",
                        orderNo = "",
                        productDate = null,
                        unitCode = ""
                    };

                    var res = scanMap.Execute(this.Logger, this.BuVO, createPalletData);


                    findItems.FindAll(x=> selectDoc.Select(y => y.ID).Contains(x.Document_ID)).ForEach(Item=>
                    {
                        var productOwner = selectDoc.Find(x => x.ID == Item.Document_ID);
                        var unitTypeSku = StaticValueManager.GetInstant().UnitTypes.Find(x => x.ID == Item.UnitType_ID);
                        var stoPack = new StorageObjectCriteria()
                        {
                            id = null,
                            code = Item.Code,
                            eventStatus = StorageObjectEventStatus.NEW,
                            name = Item.Code,
                            parentID = res.id,
                            parentType = StorageObjectType.BASE,
                            qty = Item.Quantity.Value,
                            baseQty = Item.Quantity.Value,
                            unitID = Item.UnitType_ID.Value,
                            baseUnitID = Item.UnitType_ID.Value,
                            unitCode = unitTypeSku.Code,
                            baseUnitCode = unitTypeSku.Code,
                            type = StorageObjectType.PACK,
                            areaID = res.areaID,
                            warehouseID = 1,
                            mstID = Item.PackMaster_ID,
                            options = Item.Options,
                            ref1 = Item.Ref1,
                            ref2 = Item.Ref2,
                            ref3 = Item.Ref3,
                            ref4 = Item.Ref4,
                            productDate = Item.ProductionDate,
                            skuID = Item.SKUMaster_ID,
                            productOwner = productOwner.ProductOwner_ID,
                            AuditStatus = AuditStatus.QUARANTINE,
                        };

                        var pstoID = ADO.WMSDB.StorageObjectADO.GetInstant().PutV2(stoPack, BuVO);
                        stoPack.id = pstoID;

                        var disto = new amt_DocumentItemStorageObject()
                        {
                            IsLastSeq = false,
                            DocumentItem_ID = Item.ID,
                            DocumentType_ID = DocumentTypeID.GOODS_RECEIVE,
                            WorkQueue_ID = null,
                            Sou_StorageObject_ID = stoPack.id.Value,
                            Sou_WaveSeq_ID = null,
                            Status = 0,
                            Des_StorageObject_ID = null,
                            Des_WaveSeq_ID = null,
                            Quantity = Item.Quantity.Value,
                            BaseQuantity = Item.Quantity.Value,
                            UnitType_ID = Item.UnitType_ID.Value,
                            BaseUnitType_ID = Item.UnitType_ID.Value
                        };
                        var distoBase = ADO.WMSDB.DistoADO.GetInstant().Insert(disto, BuVO);
                    });
                    result.recievedStatus = true;
                }
            }
            return result;
        }
    }
}
