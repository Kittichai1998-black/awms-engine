using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.ADO.StaticValue;
using AWMSEngine.Engine;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using ProjectAAI.ADO;

namespace ProjectAAI.Engine.Business.WorkQueue
{
    public class RegisterWorkQueue_GetSTO : IProjectEngine<RegisterWorkQueue.TReq, StorageObjectCriteria>
    {

        public StorageObjectCriteria ExecuteEngine(AMWLogger logger, VOCriteria buVO, RegisterWorkQueue.TReq reqVO)
        {
            var _base = AWMSEngine.ADO.DataADO.GetInstant().SelectByCodeActive<ams_BaseMaster>(reqVO.baseCode, buVO);
            if (_base == null)
                throw new AMWException(logger, AMWExceptionCode.V1001, "Not Found Pallet : " + reqVO.baseCode);
            var _unitType = StaticValueManager.GetInstant().UnitTypes.FirstOrDefault(x => x.ID == _base.UnitType_ID);
            var _objSize = StaticValueManager.GetInstant().ObjectSizes.FirstOrDefault(x => x.ObjectType == StorageObjectType.BASE);

            var _warehouse = StaticValueManager.GetInstant().Warehouses.FirstOrDefault(x => x.Code == reqVO.warehouseCode);
            var _area = StaticValueManager.GetInstant().AreaMasters.FirstOrDefault(x => x.Code == reqVO.areaCode);

            var packCode = reqVO.mappingPallets;

            StorageObjectCriteria baseSto = new StorageObjectCriteria()
            {
                code = reqVO.baseCode,
                eventStatus = StorageObjectEventStatus.NEW,
                name = "Pallet",
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
                areaID = _area.ID,
                warehouseID = _warehouse.ID.Value
                
            };

            var baseStoID = AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(baseSto, buVO);
            packCode.ForEach(packcode =>
            {
                var packList = GetObjectFromSAP(packcode.itemNo);
                packList.ForEach(pack =>
                {

                    var _sku = AWMSEngine.ADO.DataADO.GetInstant().SelectByCodeActive<ams_SKUMaster>(pack.MATNR, buVO);
                    if (_sku == null)
                        throw new AMWException(logger, AMWExceptionCode.V2001, "SKU " + pack.MATNR + " NotFound");
                    var _pack = AWMSEngine.ADO.DataADO.GetInstant().SelectByCodeActive<ams_PackMaster>(pack.MATNR, buVO);
                    if (_pack == null)
                        throw new AMWException(logger, AMWExceptionCode.V2001, "SKU " + pack.MATNR + " NotFound");

                    var unit = StaticValueManager.GetInstant().UnitTypes.FirstOrDefault(x => x.Code == pack.MEINS);
                    if (unit == null)
                        throw new AMWException(logger, AMWExceptionCode.V2001, "Unit Type " + pack.MEINS + " NotFound");

                    var _objSizePack = StaticValueManager.GetInstant().ObjectSizes.FirstOrDefault(x => x.ObjectType == StorageObjectType.PACK);

                    StorageObjectCriteria packSto = new StorageObjectCriteria()
                    {
                        parentID = baseStoID,
                        parentType = StorageObjectType.BASE,
                        code = pack.MATNR,
                        eventStatus = StorageObjectEventStatus.NEW,
                        name = _sku.Name,
                        batch = pack.CHARG,
                        qty = pack.VERME,
                        skuID = _sku.ID,
                        unitCode = unit.Code,
                        unitID = unit.ID.Value,
                        baseUnitCode = unit.Code,
                        baseUnitID = unit.ID.Value,
                        baseQty = pack.VERME,
                        objectSizeID = _objSizePack.ID.Value,
                        type = StorageObjectType.PACK,
                        productDate = pack.HSDAT,
                        objectSizeName = _objSizePack.Name,
                        mstID = _pack.ID.Value,
                        weiKG = reqVO.weight,
                        areaID = StaticValueManager.GetInstant().AreaMasters.FirstOrDefault(x => x.Code == reqVO.areaCode).ID.Value
                    };

                    AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(packSto, buVO);
                });
            });

            var mapsto = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(baseStoID, StorageObjectType.BASE, false, true, buVO);
            return mapsto;
        }

        private List<SAPADO.ZSWMRF001_OUT_SU> GetObjectFromSAP(string barcode)
        {

            var packList = SAPADO.ERP_RECIEVING_STORAGE(new { warehouse = "W01", barcode }); ;
            return packList;
        }
    }
}
