using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net;
using AMWUtil.Common;
using AMWUtil.DataAccess.Http;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.ADO.StaticValue;
using AWMSEngine.Engine;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using ProjectAAI.ADO;
using ProjectAAI.ADO.SAPApi;
using static ProjectAAI.ADO.SAPApi.SAPCriteria;
using static ProjectAAI.ADO.SAPApi.SAPInterfaceADO;

namespace ProjectAAI.Engine.Business.WorkQueue
{
    public class RegisterWorkQueue_GetSTO : IProjectEngine<RegisterWorkQueue.TReq, StorageObjectCriteria>
    {
        public StorageObjectCriteria ExecuteEngine(AMWLogger logger, VOCriteria buVO, RegisterWorkQueue.TReq reqVO)
        {
            var chkStos = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(reqVO.baseCode, null, null, false, true, buVO);
            if (chkStos != null)
            {
                return chkStos;
            }
            else
            {
                var _base = AWMSEngine.ADO.DataADO.GetInstant().SelectByCodeActive<ams_BaseMaster>(reqVO.baseCode, buVO);

                if (_base == null)
                {
                    var BaseMasterType = StaticValueManager.GetInstant().BaseMasterTypes.FirstOrDefault();
                    ams_BaseMaster newBase = new ams_BaseMaster()
                    {
                        Code = reqVO.baseCode,
                        ObjectSize_ID = BaseMasterType.ObjectSize_ID,
                        UnitType_ID = BaseMasterType.UnitType_ID,
                        Name = "Pallet",
                        WeightKG = BaseMasterType.Weight,
                        BaseMasterType_ID = BaseMasterType.ID.Value,
                        Status = EntityStatus.ACTIVE
                    };
                    var idbase = AWMSEngine.ADO.DataADO.GetInstant().Insert<ams_BaseMaster>(buVO, newBase);
                    _base = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<ams_BaseMaster>(idbase, buVO);
                    if (_base == null)
                    {
                        throw new AMWException(logger, AMWExceptionCode.V1001, "Not Found Pallet : " + reqVO.baseCode);
                    }

                }
                var _unitType = StaticValueManager.GetInstant().UnitTypes.FirstOrDefault(x => x.ID == _base.UnitType_ID);
                var _objSize = StaticValueManager.GetInstant().ObjectSizes.FirstOrDefault(x => x.ObjectType == StorageObjectType.BASE);

                var _warehouse = StaticValueManager.GetInstant().Warehouses.FirstOrDefault(x => x.Code == reqVO.warehouseCode);
                var _area = StaticValueManager.GetInstant().AreaMasters.FirstOrDefault(x => x.Code == reqVO.areaCode);

                 
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
                    warehouseID = _warehouse.ID.Value,
                    weiKG = reqVO.weight

                };

                var baseStoID = AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(baseSto, buVO);
                
                    var packList = GetObjectFromSAP(reqVO.baseCode, reqVO.warehouseCode, buVO);
                    packList.datas.ForEach(pack =>
                    {

                        var skuCode = pack.MATNR.TrimStart(new char[] { '0' }); //MATNR : Material Number
                        var _sku = AWMSEngine.ADO.DataADO.GetInstant().SelectByCodeActive<ams_SKUMaster>(skuCode, buVO);
                        if (_sku == null) 
                            throw new AMWException(logger, AMWExceptionCode.V2001, "SKU " + skuCode + " Not Found");
                        var _pack = AWMSEngine.ADO.DataADO.GetInstant().SelectByCodeActive<ams_PackMaster>(skuCode, buVO);
                        if (_pack == null)
                            throw new AMWException(logger, AMWExceptionCode.V2001, "SKU " + pack.MATNR + " Not Found");

                        var unit = StaticValueManager.GetInstant().UnitTypes.FirstOrDefault(x => x.Code == pack.MEINS);
                        if (unit == null)
                            throw new AMWException(logger, AMWExceptionCode.V2001, "Unit Type " + pack.MEINS + " Not Found"); // MEINS : Base Unit of Measure
                        if(_sku.UnitType_ID != unit.ID)
                            throw new AMWException(logger, AMWExceptionCode.V2001, "Unit Type " + pack.MEINS + " Not Match"); // MEINS : Base Unit of Measure
                        var _objSizePack = StaticValueManager.GetInstant().ObjectSizes.Find(x => x.ID == _pack.ObjectSize_ID);
                        //var _objSizePack = StaticValueManager.GetInstant().ObjectSizes.FirstOrDefault(x => x.ObjectType == StorageObjectType.PACK);

                        DateTime productDate = DateTime.ParseExact(pack.HSDAT,"yyyyMMdd", CultureInfo.InvariantCulture); //"20190527"
                        DateTime incubatedate = productDate.AddDays(pack.WEBAZ - 1); 
                        var incb = DateTimeUtil.ToISOUTCString(incubatedate);
                        DateTime fvdt1 = DateTime.ParseExact(pack.FVDT1, "yyyyMMdd", CultureInfo.InvariantCulture);
                        var approveddate = DateTimeUtil.ToISOUTCString(fvdt1);
                        var options = ObjectUtil.QryStrSetValue(null, 
                            new KeyValuePair<string, object>("bestq", pack.BESTQ), //Stock Category 
                            new KeyValuePair<string, object>("webaz", pack.WEBAZ), //Incubated Time
                            new KeyValuePair<string, object>("incubatedate", incb),
                            new KeyValuePair<string, object>("fvdt1", approveddate) //approved date 
                            );

                        StorageObjectCriteria packSto = new StorageObjectCriteria()
                        {
                            parentID = baseStoID,
                            parentType = StorageObjectType.BASE,
                            code = skuCode,
                            eventStatus = StorageObjectEventStatus.NEW,
                            name = _sku.Name,
                            batch = pack.CHARG,
                            qty = pack.VERME, //Available Stock
                            skuID = _sku.ID,
                            unitCode = unit.Code,
                            unitID = unit.ID.Value,
                            baseUnitCode = unit.Code,
                            baseUnitID = unit.ID.Value,
                            baseQty = pack.VERME, //Available Stock
                            objectSizeID = _objSizePack.ID.Value,
                            type = StorageObjectType.PACK,
                            productDate = productDate, //Date of Manufacture
                            objectSizeName = _objSizePack.Name,
                            options = options,
                            mstID = _pack.ID.Value,
                            weiKG = WeightUtil.ConvertToKG(pack.BRGEW, pack.GEWEI), //BRGEW : Gross Weight, GEWEI : Weight Unit
                            areaID = StaticValueManager.GetInstant().AreaMasters.FirstOrDefault(x => x.Code == reqVO.areaCode).ID.Value,
                            refID = pack.LENUM, //SU : Storage Unit Number
                            ref1 = pack.FVDT1 != null || pack.FVDT1.Length > 0 ? "y" : null //ถ้ามีค่า approved date ให้ใส่เป็น y ถ้าไม่มีใส่ null
                        };

                        AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(packSto, buVO);
                    });
                
                var mapsto = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(baseStoID, StorageObjectType.BASE, false, true, buVO);
                return mapsto;
            }
        }

        private SapResponse<ZSWMRF001_OUT_SU> GetObjectFromSAP(string barcode, string warehouse, VOCriteria buVO)
        {
            var res = SAPInterfaceADO.GetInstant().ZWMRF001(barcode, buVO);
            return res;
        }
    }
}
