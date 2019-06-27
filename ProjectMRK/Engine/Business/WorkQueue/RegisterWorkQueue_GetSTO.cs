using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.Engine;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;

namespace ProjectMRK.Engine.Business.WorkQueue
{
    public class RegisterWorkQueue_GetSTO : IProjectEngine<RegisterWorkQueue.TReq, StorageObjectCriteria>
    {
        private ams_AreaLocationMaster _locationASRS;
        private ams_Warehouse _warehouseASRS;
        private ams_AreaMaster _areaASRS;

        public StorageObjectCriteria ExecuteEngine(AMWLogger logger, VOCriteria buVO, RegisterWorkQueue.TReq reqVO)
        {
            this.InitDataASRS(reqVO, logger, buVO);

            var sto = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(reqVO.baseCode, null, null, false, true, buVO);

            //if (sto == null)
            //{
            //    var staticValue = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant();
            //    var _baseSto = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>("Code", reqVO.baseCode, buVO).OrderByDescending(x => x.ID).FirstOrDefault();
            //    if (_baseSto == null)
            //        throw new AMWException(logger, AMWExceptionCode.V1001, "Storage Object of Base Code: '" + reqVO.baseCode + "' Not Found");

            //    var objSizeBase = staticValue.ObjectSizes.FirstOrDefault(x => x.ObjectType == StorageObjectType.BASE);
            //    var objSizePack = staticValue.ObjectSizes.FirstOrDefault(x => x.ObjectType == StorageObjectType.PACK);

            //    StorageObjectCriteria baseSto = new StorageObjectCriteria()
            //    {
            //        code = _baseSto.Code,
            //        eventStatus = StorageObjectEventStatus.NEW,
            //        name = "Pallet",
            //        qty = 1,
            //        unitCode = staticValue.UnitTypes.FirstOrDefault(x => x.ObjectType == StorageObjectType.BASE).Code,
            //        unitID = staticValue.UnitTypes.FirstOrDefault(x => x.ObjectType == StorageObjectType.BASE).ID.Value,
            //        baseUnitCode = staticValue.UnitTypes.FirstOrDefault(x => x.ObjectType == StorageObjectType.BASE).Code,
            //        baseUnitID = staticValue.UnitTypes.FirstOrDefault(x => x.ObjectType == StorageObjectType.BASE).ID.Value,
            //        baseQty = 1,
            //        objectSizeID = objSizeBase.ID,
            //        type = StorageObjectType.BASE,
            //        mstID = _baseSto.BaseMaster_ID,
            //        objectSizeName = objSizeBase.Name,
            //        lengthM = reqVO.length,
            //        heightM = reqVO.height,
            //        widthM = reqVO.width,
            //        weiKG = reqVO.weight,
            //        warehouseID = _warehouseASRS.ID.Value,
            //        areaID = _areaASRS.ID.Value,
            //        parentID = _locationASRS.ID.Value,
            //        parentType = StorageObjectType.LOCATION
            //    };

            //    var baseStoID = AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(baseSto, buVO);

            //    var _packSto = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>("ParentStorageObject_ID", _baseSto.ID, buVO).FirstOrDefault();

            //    var sku = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<ams_SKUMaster>("Code", _packSto.Code, buVO).FirstOrDefault();
            //    var unit = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<ams_UnitType>(sku.UnitType_ID, buVO);

            //    var packSto = new StorageObjectCriteria()
            //    {
            //        parentID = baseStoID,
            //        parentType = StorageObjectType.BASE,
            //        code = _packSto.Code,
            //        eventStatus = StorageObjectEventStatus.NEW,
            //        name = _packSto.Name,
            //        batch = _packSto.Batch,
            //        qty = Convert.ToDecimal(reqVO.mappingPallets.FirstOrDefault().qty),
            //        skuID = sku.ID.Value,
            //        unitCode = unit.Code,
            //        unitID = unit.ID.Value,
            //        baseUnitCode = unit.Code,
            //        baseUnitID = unit.ID.Value,
            //        baseQty = Convert.ToDecimal(reqVO.mappingPallets.FirstOrDefault().qty),
            //        objectSizeID = objSizePack.ID.Value,
            //        type = StorageObjectType.PACK,
            //        productDate = _packSto.ProductDate,
            //        objectSizeName = objSizePack.Name,
            //        mstID = _packSto.PackMaster_ID,
            //        weiKG = reqVO.weight
            //    };

            //    var packStoID = AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(packSto, buVO);

            //    sto = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(reqVO.baseCode, null, null, false, true, buVO);

            //}

            sto.lengthM = reqVO.length;
            sto.heightM = reqVO.height;
            sto.widthM = reqVO.width;
            sto.weiKG = reqVO.weight;
            sto.warehouseID = _warehouseASRS.ID.Value;
            sto.areaID = _areaASRS.ID.Value;
            sto.parentID = _locationASRS.ID.Value;
            sto.parentType = StorageObjectType.LOCATION;

            AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(sto, buVO);

            if(sto == null)
                throw new AMWException(logger, AMWExceptionCode.V1001, "Base Code '" + reqVO.baseCode + "' Not Found");

            return sto;
        }

        private void InitDataASRS(RegisterWorkQueue.TReq reqVO, AMWLogger logger, VOCriteria buVO)
        {
            var StaticValue = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant();

            this._warehouseASRS = StaticValue.Warehouses.FirstOrDefault(x => x.Code == reqVO.warehouseCode);
            if (_warehouseASRS == null)
                throw new AMWException(logger, AMWExceptionCode.V1001, "Warehouse Code '" + reqVO.warehouseCode + "' Not Found");
            this._areaASRS = StaticValue.AreaMasters.FirstOrDefault(x => x.Code == reqVO.areaCode && x.Warehouse_ID == _warehouseASRS.ID);
            if (_areaASRS == null)
                throw new AMWException(logger, AMWExceptionCode.V1001, "Area Code '" + reqVO.areaCode + "' Not Found");
            this._locationASRS = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>(
                new KeyValuePair<string, object>[] {
                    new KeyValuePair<string,object>("Code",reqVO.locationCode),
                    new KeyValuePair<string,object>("AreaMaster_ID",_areaASRS.ID.Value),
                    new KeyValuePair<string,object>("Status", EntityStatus.ACTIVE)
                }, buVO).FirstOrDefault();
            if (_locationASRS == null)
                throw new AMWException(logger, AMWExceptionCode.V1001, "Location Code '" + reqVO.locationCode + "' Not Found");
        }
    }
}
