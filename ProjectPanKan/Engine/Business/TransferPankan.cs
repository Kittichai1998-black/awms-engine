using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.Engine;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;

namespace ProjectPanKan.Engine.Business
{
    public class TransferPankan : BaseEngine<TransferPankan.TReq, StorageObjectCriteria>
    {
        public class TReq
        {
            public string desBase;
           //public string desArea;
            public int? warehouseID;
            public int? areaID;
            public string souBase;
            public string souPack;
           // public String souArea;
            public int quantity;
        }

        protected override StorageObjectCriteria ExecuteEngine(TReq reqVO)
        {



            //var location = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>(new SQLConditionCriteria[]{
            //     new SQLConditionCriteria("Code",reqVO.souArea , SQLOperatorType.EQUALS),
            //    }, this.BuVO).FirstOrDefault();
            //if (location == null)
            //    throw new AMWException(this.Logger, AMWExceptionCode.V2001, "Arealocation " + reqVO.souPack + " NotFound");



            var sku = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<ams_SKUMaster>(new SQLConditionCriteria[]{
                 new SQLConditionCriteria("Code", reqVO.souPack, SQLOperatorType.EQUALS),
                }, this.BuVO).FirstOrDefault();
            if (sku == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V2001, "SKU " + reqVO.souPack + " NotFound");

            var pack = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<ams_PackMaster>(new SQLConditionCriteria[]{
                 new SQLConditionCriteria("SKUMaster_ID", sku.ID, SQLOperatorType.EQUALS),
                 new SQLConditionCriteria("BaseUnitType_ID", sku.UnitType_ID, SQLOperatorType.EQUALS)}, this.BuVO).FirstOrDefault();
            if (pack == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V2001, "SKU " + reqVO.souPack + " NotFound");

            var souBase = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(reqVO.souBase, reqVO.areaID, reqVO.warehouseID, false, true, this.BuVO);

            var packSto = souBase.ToTreeList()
                .FindAll(x=>x.type == StorageObjectType.PACK && x.code == reqVO.souPack);
            if (packSto.Count == 0)
                throw new AMWException(this.Logger, AMWExceptionCode.V2001, "Pack Not Found");

            var baseMaster = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<ams_BaseMaster>(new SQLConditionCriteria[]
            {
                new SQLConditionCriteria("code", reqVO.desBase, SQLOperatorType.EQUALS)
            }, this.BuVO).FirstOrDefault();

            if (baseMaster == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V2001, "Base Master Not Found");

            var objSizeBase = StaticValue.ObjectSizes.FirstOrDefault(x => x.ID == baseMaster.ObjectSize_ID);
            var objSizePack = StaticValue.ObjectSizes.FirstOrDefault(x => x.ID == pack.ObjectSize_ID);


            var desBase = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(reqVO.desBase, reqVO.areaID, reqVO.warehouseID,  false, true, this.BuVO);
            
            if (desBase == null)
            {
                StorageObjectCriteria baseSto = new StorageObjectCriteria()
                {
                    code = reqVO.desBase,
                    eventStatus = StorageObjectEventStatus.NEW,
                    name = "Box",
                    qty = 1,
                    unitCode = StaticValue.UnitTypes.FirstOrDefault(x => x.ObjectType == StorageObjectType.BASE).Code,
                    unitID = StaticValue.UnitTypes.FirstOrDefault(x => x.ObjectType == StorageObjectType.BASE).ID.Value,
                    baseUnitCode = StaticValue.UnitTypes.FirstOrDefault(x => x.ObjectType == StorageObjectType.BASE).Code,
                    baseUnitID = StaticValue.UnitTypes.FirstOrDefault(x => x.ObjectType == StorageObjectType.BASE).ID.Value,
                    baseQty = 1,
                    objectSizeID = objSizeBase.ID.Value,
                    type = StorageObjectType.BASE,
                    mstID = baseMaster.ID.Value,
                    objectSizeName = objSizeBase.Name,                  
                    areaID = reqVO.areaID,
                };

                var stoID = AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(baseSto, this.BuVO);

                var childSto = new StorageObjectCriteria()
                {
                    parentID = null,
                    parentType = StorageObjectType.BASE,
                    code = reqVO.souPack,
                    eventStatus = StorageObjectEventStatus.NEW,
                    name = sku.Name,
                    qty = reqVO.quantity,
                    skuID = sku.ID,
                    baseQty = reqVO.quantity,
                    objectSizeID = objSizePack.ID.Value,
                    type = StorageObjectType.PACK,
                    objectSizeName = objSizePack.Name,
                    mstID = pack.ID,
                    areaID = reqVO.areaID,
                    unitCode = StaticValue.UnitTypes.FirstOrDefault(x => x.ID == sku.UnitType_ID).Code,
                    unitID = sku.UnitType_ID.Value,
                    baseUnitCode = StaticValue.UnitTypes.FirstOrDefault(x => x.ID == sku.UnitType_ID).Code,
                    baseUnitID = sku.UnitType_ID.Value,
                };
                var childStoID = AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(childSto, this.BuVO);
                baseSto.mapstos = new List<StorageObjectCriteria>() { childSto };
                
            }
            else
            {
                if (desBase.eventStatus != StorageObjectEventStatus.RECEIVED && desBase.eventStatus != StorageObjectEventStatus.NEW)
                    throw new AMWException(this.Logger, AMWExceptionCode.V2001, "Cannot Transfer to Box");

                var desPack = desBase.ToTreeList()
                .Find(x => x.type == StorageObjectType.PACK && x.code == reqVO.souPack);

                if(desPack == null)
                {
                    var childSto = new StorageObjectCriteria()
                    {
                        parentID = desBase.id,
                        parentType = StorageObjectType.BASE,
                        code = reqVO.souPack,
                        eventStatus = StorageObjectEventStatus.NEW,
                        name = sku.Name,
                        qty = reqVO.quantity,
                        skuID = sku.ID,
                        baseQty = reqVO.quantity,
                        objectSizeID = objSizePack.ID.Value,
                        type = StorageObjectType.PACK,
                        objectSizeName = objSizePack.Name,
                        mstID = pack.ID,
                        areaID=reqVO.areaID,
                        unitID= pack.UnitType_ID,
                        baseUnitID = pack.BaseUnitType_ID,
                    };
                    var childStoID = AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(childSto, this.BuVO);
                    
                    var souPack = packSto.Find(x => x.code == reqVO.souPack);
                    var qty = souPack.qty - reqVO.quantity;

                    souPack.qty = qty;
                    souPack.baseQty = qty;
                    if (qty == 0)
                    {
                        souPack.eventStatus = StorageObjectEventStatus.REMOVED;
                    }
                    var updchildStoID = AWMSEngine.ADO.StorageObjectADO.GetInstant()
                        .PutV2(souPack, this.BuVO);

                }
                else
                {
                    var souPack = packSto.Find(x => x.code == reqVO.souPack);
                    var qty = souPack.qty - reqVO.quantity;

                    desPack.qty = reqVO.quantity + desPack.qty;
                    desPack.baseQty = reqVO.quantity + desPack.baseQty;
                    var childStoID = AWMSEngine.ADO.StorageObjectADO.GetInstant()
                        .PutV2(desPack, this.BuVO);

                    souPack.qty = qty;
                    souPack.baseQty = qty;

                    if (qty == 0)
                    {
                        souPack.eventStatus = StorageObjectEventStatus.REMOVED;
                    }
                    var updchildStoID = AWMSEngine.ADO.StorageObjectADO.GetInstant()
                        .PutV2(souPack, this.BuVO);
                }
            }

            souBase = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(reqVO.souBase, reqVO.areaID, reqVO.warehouseID,  false, true, this.BuVO);
            if(souBase.ToTreeList().TrueForAll(x=>x.eventStatus == StorageObjectEventStatus.REMOVED))
            {
                AWMSEngine.ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(souBase.id.Value, null, null, StorageObjectEventStatus.REMOVED, this.BuVO);
            }

            var res = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(reqVO.desBase, reqVO.areaID, reqVO.warehouseID, false, true, this.BuVO);
          
            return res;
        }
    }
}