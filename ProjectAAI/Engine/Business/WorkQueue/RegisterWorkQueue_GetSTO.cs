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
using AWMSModel.Constant.StringConst;
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
                
                    var packList = GetObjectFromSAP(reqVO.baseCode, buVO);
                    packList.datas.ForEach(pack =>
                    {
                        var unit = StaticValueManager.GetInstant().UnitTypes.FirstOrDefault(x => x.Code == pack.MEINS);
                        if (unit == null)
                        {
                            //throw new AMWException(logger, AMWExceptionCode.V2001, "Unit Type " + pack.MEINS + " Not Found"); // MEINS : Base Unit of Measure
                            ams_UnitType newUnitType = new ams_UnitType()
                            {
                                Code = pack.MEINS,
                                Name = pack.MEINS,
                                ObjectType = StorageObjectType.PACK,
                                Status = EntityStatus.ACTIVE
                            };
                            var idNewUnitType = AWMSEngine.ADO.DataADO.GetInstant().Insert<ams_UnitType>(buVO, newUnitType);
                            unit = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<ams_UnitType>(idNewUnitType, buVO);
                            StaticValueManager.GetInstant().ClearStaticByTableName("ams_UnitType");

                        }
                        var skuCode = pack.MATNR.TrimStart(new char[] { '0' }); //MATNR : Material Number
                        var _sku = AWMSEngine.ADO.DataADO.GetInstant().SelectByCodeActive<ams_SKUMaster>(skuCode, buVO);
                        if (_sku == null)
                        {
                            ams_SKUMasterType skutype = StaticValueManager.GetInstant().SKUMasterTypes.FirstOrDefault(x => x.Code == "FG");
                            if(skutype == null)
                                throw new AMWException(logger, AMWExceptionCode.V2001, "SKU Master Type 'FG' Not Found");

                            ams_SKUMaster newSKU = new ams_SKUMaster()
                            {
                                Code = skuCode,
                                Name = pack.MAKTX, //MAKTX : Material Description
                                Description = pack.MAKTX,
                                UnitType_ID = unit.ID,
                                ObjectSize_ID = skutype.ObjectSize_ID.Value,
                                SKUMasterType_ID = skutype.ID.Value,
                                Status = EntityStatus.ACTIVE
                            };

                            var idNewSKU = AWMSEngine.ADO.DataADO.GetInstant().Insert<ams_SKUMaster>(buVO, newSKU);
                            _sku = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<ams_SKUMaster>(idNewSKU, buVO);
                            StaticValueManager.GetInstant().ClearStaticByTableName("ams_SKUMaster");

                        }
                        if (_sku.UnitType_ID != unit.ID)
                            throw new AMWException(logger, AMWExceptionCode.V2001, "Unit Type " + pack.MEINS + " Not Match"); // MEINS : Base Unit of Measure


                        var _pack = AWMSEngine.ADO.DataADO.GetInstant().SelectByCodeActive<ams_PackMaster>(skuCode, buVO);
                        if (_pack == null)
                        {
                           throw new AMWException(logger, AMWExceptionCode.V2001, "SKU " + pack.MATNR + " Not Found");
                           // _pack = AWMSEngine.ADO.DataADO.GetInstant().SelectByCodeActive<ams_PackMaster>(_sku.Code, buVO);
                        }
                         

                        var _objSizePack = StaticValueManager.GetInstant().ObjectSizes.Find(x => x.ID == _pack.ObjectSize_ID);
                        //var _objSizePack = StaticValueManager.GetInstant().ObjectSizes.FirstOrDefault(x => x.ObjectType == StorageObjectType.PACK);

                        DateTime? productDate = pack.HSDAT == "00000000" ? (DateTime?)null : DateTime.ParseExact(pack.HSDAT,"yyyyMMdd", CultureInfo.InvariantCulture); //"20190527"
                        DateTime? expiryDate = pack.VFDAT == "00000000" ? (DateTime?)null : DateTime.ParseExact(pack.VFDAT,"yyyyMMdd", CultureInfo.InvariantCulture); //"20190527"
                        DateTime? incubatedate = productDate == null ? (DateTime?)null : productDate.Value.AddDays(Convert.ToDouble(pack.WEBAZ) - 1); 
                        var incb = incubatedate == null ? null : DateTimeUtil.ToISOUTCString(incubatedate.Value);
                        DateTime? fvdt1 = pack.FVDT1 == "00000000" ? (DateTime?)null : DateTime.ParseExact(pack.FVDT1, "yyyyMMdd", CultureInfo.InvariantCulture);
                        var approveddate = fvdt1 == null ? null : DateTimeUtil.ToISOUTCString(fvdt1.Value);
                        var options = ObjectUtil.QryStrSetValue(null, 
                            new KeyValuePair<string, object>(OptionVOConst.OPT_BESTQ, pack.BESTQ), //Stock Category 
                            new KeyValuePair<string, object>(OptionVOConst.OPT_WEBAZ, pack.WEBAZ), //Incubated Time
                            new KeyValuePair<string, object>(OptionVOConst.OPT_VBELN, pack.VBELN), //sales order 
                            new KeyValuePair<string, object>(OptionVOConst.OPT_INCBD, incb),
                            new KeyValuePair<string, object>(OptionVOConst.OPT_FVDT1, approveddate) //approved date 
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
                            productDate = productDate.Value, //Date of Manufacture
                            expiryDate = expiryDate.Value,
                            objectSizeName = _objSizePack.Name,
                            options = options,
                            mstID = _pack.ID.Value,
                            weiKG = WeightUtil.ConvertToKG(pack.BRGEW, pack.GEWEI), //BRGEW : Gross Weight, GEWEI : Weight Unit
                            areaID = StaticValueManager.GetInstant().AreaMasters.FirstOrDefault(x => x.Code == reqVO.areaCode).ID.Value,
                            refID = pack.LENUM, //SU : Storage Unit Number
                            ref1 = fvdt1 == null ? null : "y"  //ถ้ามีค่า approved date ให้ใส่เป็น y ถ้าไม่มีใส่ null
                        };

                        AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(packSto, buVO);
                    });

                var BESTQ = packList.datas.Select(x => x.BESTQ).Distinct().First();
                var opt_done = "";
                
                if(BESTQ == "Q")
                {
                        opt_done = AMWUtil.Common.ObjectUtil.QryStrSetValue(opt_done, OptionVOConst.OPT_DONE_DES_EVENT_STATUS, StorageObjectEventStatus.QC.GetValueInt()); 
                }
                else if (BESTQ == "S")
                    {
                        opt_done = AMWUtil.Common.ObjectUtil.QryStrSetValue(opt_done, OptionVOConst.OPT_DONE_DES_EVENT_STATUS, StorageObjectEventStatus.HOLD.GetValueInt());
                    }
                    else 
                    {
                        opt_done = AMWUtil.Common.ObjectUtil.QryStrSetValue(opt_done, OptionVOConst.OPT_DONE_DES_EVENT_STATUS, StorageObjectEventStatus.RECEIVED.GetValueInt());
                    }
                
                AWMSEngine.ADO.DataADO.GetInstant().UpdateByID<amt_StorageObject>(baseStoID, buVO,
                    new KeyValuePair<string, object>[] {
                        new KeyValuePair<string, object>("Options", opt_done)
                    });
                var mapsto = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(baseStoID, StorageObjectType.BASE, false, true, buVO);
                return mapsto;
            }
        }

        private SapResponse<ZSWMRF001_OUT_SU> GetObjectFromSAP(string barcode, VOCriteria buVO)
        {
            var res = SAPInterfaceADO.GetInstant().ZWMRF001(barcode, buVO);
            if (res.datas != null)
            {
                if (res.datas.Any(x => !string.IsNullOrEmpty(x.ERR_MSG)))
                {
                    throw new AMWException(buVO.Logger, AMWExceptionCode.S0001, res.datas.Find(x => !string.IsNullOrEmpty(x.ERR_MSG)).ERR_MSG);
                }
            }
            else
            {
                throw new AMWException(buVO.Logger, AMWExceptionCode.S0001, res.message);
            }
            return res;
        }
    }
}
