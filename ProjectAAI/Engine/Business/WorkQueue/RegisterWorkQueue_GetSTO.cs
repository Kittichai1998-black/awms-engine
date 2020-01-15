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
                if (chkStos.eventStatus == StorageObjectEventStatus.RECEIVED)
                {
                    return chkStos;
                }
                else if (chkStos.eventStatus == StorageObjectEventStatus.RECEIVING)
                {
                    throw new AMWException(logger, AMWExceptionCode.V1001, "SU No. '" + reqVO.baseCode + "' is currently receiving into ASRS.");
                }
                else
                {
                    throw new AMWException(logger, AMWExceptionCode.V1001, "Can't receive this SU No. '" + reqVO.baseCode + "'");
                }
            }
            else
            {
                bool checkEmpPallet = false;
                if (reqVO.mappingPallets != null && reqVO.mappingPallets.Count > 0)
                {
                    checkEmpPallet = StaticValueManager.GetInstant().SKUMasterEmptyPallets.Any(x => x.Code == reqVO.mappingPallets[0].code);
                }


                var _base = AWMSEngine.ADO.DataADO.GetInstant().SelectByCodeActive<ams_BaseMaster>(reqVO.baseCode, buVO);

                if (_base == null)
                {

                    var BaseMasterType = StaticValueManager.GetInstant().BaseMasterTypes.FirstOrDefault();

                    ams_BaseMaster newBase = new ams_BaseMaster()
                    {
                        Code = reqVO.baseCode,
                        ObjectSize_ID = BaseMasterType.ObjectSize_ID,
                        UnitType_ID = BaseMasterType.UnitType_ID,
                        Name = checkEmpPallet ? "Empty Pallet" : "Pallet",
                        WeightKG = BaseMasterType.Weight,
                        BaseMasterType_ID = BaseMasterType.ID.Value,
                        Status = EntityStatus.ACTIVE
                    };

                    var idbase = AWMSEngine.ADO.DataADO.GetInstant().Insert<ams_BaseMaster>(buVO, newBase);
                    _base = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<ams_BaseMaster>(idbase, buVO);
                    if (_base == null)
                    {
                        throw new AMWException(logger, AMWExceptionCode.V1001, "Pallet : " + reqVO.baseCode + " Not Found.");
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
                    name = checkEmpPallet ? "Empty Pallet" : "Pallet",
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
                    //weiKG = reqVO.weight,
                    lengthM = reqVO.length,
                    heightM = reqVO.height,
                    widthM = reqVO.width,
                    ref2 = checkEmpPallet ? null : "I00"
                };

                var baseStoID = AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(baseSto, buVO);
                if (checkEmpPallet)
                {
                    //check จาก code ที่อยู่ใน PalletDataCriteriaV2
                    var PackMasterEmptyPallets = AWMSEngine.ADO.DataADO.GetInstant().SelectByCodeActive<ams_PackMaster>(reqVO.mappingPallets[0].code, buVO);

                    // var PackMasterEmptyPallets = StaticValueManager.GetInstant().SKUMasterEmptyPallets.FirstOrDefault();
                    var unit = StaticValueManager.GetInstant().UnitTypes.FirstOrDefault(x => x.ID == PackMasterEmptyPallets.UnitType_ID);
                    var _objSizePack = StaticValueManager.GetInstant().ObjectSizes.Find(x => x.ID == PackMasterEmptyPallets.ObjectSize_ID);

                    StorageObjectCriteria packSto = new StorageObjectCriteria()
                    {
                        parentID = baseStoID,
                        parentType = StorageObjectType.BASE,
                        code = PackMasterEmptyPallets.Code,
                        eventStatus = StorageObjectEventStatus.NEW,
                        name = PackMasterEmptyPallets.Name,
                        qty = Convert.ToDecimal(reqVO.mappingPallets.First().qty),
                        skuID = PackMasterEmptyPallets.SKUMaster_ID,
                        unitCode = unit.Code,
                        unitID = unit.ID.Value,
                        baseUnitCode = unit.Code,
                        baseUnitID = unit.ID.Value,
                        baseQty = Convert.ToDecimal(reqVO.mappingPallets.First().qty),
                        objectSizeID = PackMasterEmptyPallets.ObjectSize_ID,
                        type = StorageObjectType.PACK,
                        objectSizeName = _objSizePack.Name,
                        mstID = PackMasterEmptyPallets.ID.Value,
                        options = reqVO.mappingPallets.First().options,
                        areaID = StaticValueManager.GetInstant().AreaMasters.FirstOrDefault(x => x.Code == reqVO.areaCode).ID.Value,
                    };
                    AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(packSto, buVO);

                }
                else
                {

                    var packList = GetObjectFromSAP(reqVO.baseCode, buVO);
                    packList.datas.ForEach(pack =>
                    {
                        if (pack.LGTYP == "R00")
                            throw new AMWException(logger, AMWExceptionCode.V2001, "Pallet was in Autowarehouse");

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
                            //StaticValueManager.GetInstant().ClearStaticByTableName("ams_UnitType");
                            StaticValueManager.GetInstant().LoadUnitType(buVO);

                            unit = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<ams_UnitType>(idNewUnitType, buVO);

                        }
                        var skuCode = pack.MATNR.TrimStart(new char[] { '0' }); //MATNR : Material Number
                        var _sku = AWMSEngine.ADO.DataADO.GetInstant().SelectByCodeActive<ams_SKUMaster>(skuCode, buVO);
                        if (_sku == null)
                        {
                            ams_SKUMasterType skutype = StaticValueManager.GetInstant().SKUMasterTypes.FirstOrDefault(x => x.Code == "FG");
                            if (skutype == null)
                                throw new AMWException(logger, AMWExceptionCode.V2001, "SKU Master Type 'FG' Not Found");

                            ams_SKUMaster newSKU = new ams_SKUMaster()
                            {
                                Code = skuCode,
                                Name = pack.MAKTX, //MAKTX : Material Description
                                Description = pack.MAKTX,
                                UnitType_ID = unit.ID,
                                ObjectSize_ID = skutype.ObjectSize_ID.Value,
                                SKUMasterType_ID = skutype.ID.Value,
                                Status = EntityStatus.ACTIVE,
                                WeightKG = WeightUtil.ConvertToKG(pack.BRGEW, pack.GEWEI) ////BRGEW : Gross Weight, GEWEI : Weight Unit
                            };

                            var idNewSKU = AWMSEngine.ADO.DataADO.GetInstant().Insert<ams_SKUMaster>(buVO, newSKU);
                            StaticValueManager.GetInstant().LoadPackUnitConvert(buVO);
                            _sku = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<ams_SKUMaster>(idNewSKU, buVO);

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
                        DateTime? productDate = pack.HSDAT == "00000000" ? (DateTime?)null : DateTime.ParseExact(pack.HSDAT, "yyyyMMdd", CultureInfo.InvariantCulture); //"20190527" Date of Manufacture
                        DateTime? expiryDate = pack.VFDAT == "00000000" ? (DateTime?)null : DateTime.ParseExact(pack.VFDAT, "yyyyMMdd", CultureInfo.InvariantCulture); //"20190527" Shelf Life 
                        var shld = expiryDate == null ? null : DateTimeUtil.ToISOUTCString(expiryDate.Value);
                        DateTime? incubatedate = productDate == null ? (DateTime?)null : pack.WEBAZ != 0 ? productDate.Value.AddDays(Convert.ToDouble(pack.WEBAZ) - 1) : (DateTime?)null;
                        var incb = incubatedate == null ? null : DateTimeUtil.ToISOUTCString(incubatedate.Value);
                        DateTime? fvdt1 = pack.FVDT1 == "00000000" ? (DateTime?)null : DateTime.ParseExact(pack.FVDT1, "yyyyMMdd", CultureInfo.InvariantCulture);
                        var approveddate = fvdt1 == null ? null : DateTimeUtil.ToISOUTCString(fvdt1.Value);
                        StorageObjectEventStatus doneEStatus = StorageObjectEventStatus.RECEIVED;
                        if (pack.BESTQ == "S")
                        {
                            doneEStatus = StorageObjectEventStatus.HOLD;
                        }
                        else if (pack.BESTQ == "Q")
                        {
                            doneEStatus = StorageObjectEventStatus.QC;
                        }

                        var options = ObjectUtil.QryStrSetValue(null,
                            // new KeyValuePair<string, object>(OptionVOConst.OPT_LGTYP, pack.LGTYP),
                            new KeyValuePair<string, object>(OptionVOConst.OPT_BESTQ, pack.BESTQ), //Stock Category 
                            new KeyValuePair<string, object>(OptionVOConst.OPT_DONE_DES_EVENT_STATUS, doneEStatus.GetValueInt()),
                            new KeyValuePair<string, object>(OptionVOConst.OPT_WEBAZ, pack.WEBAZ), //Incubated Time
                            new KeyValuePair<string, object>(OptionVOConst.OPT_HSDAT, pack.HSDAT), //Date of Manufacture
                            new KeyValuePair<string, object>(OptionVOConst.OPT_SHLD, shld), //Shelf Life Date
                            new KeyValuePair<string, object>(OptionVOConst.OPT_VBELN, pack.VBELN), //sales order 
                            new KeyValuePair<string, object>(OptionVOConst.OPT_INCBD, incb), //Incubated Date
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
                            skuID = _sku.ID.Value,
                            unitCode = unit.Code,
                            unitID = unit.ID.Value,
                            baseUnitCode = unit.Code,
                            baseUnitID = unit.ID.Value,
                            orderNo = pack.VBELN,
                            baseQty = pack.VERME, //Available Stock
                            objectSizeID = _objSizePack.ID.Value,
                            type = StorageObjectType.PACK,
                            productDate = productDate, //Date of Manufacture
                            expiryDate = expiryDate,
                            objectSizeName = _objSizePack.Name,
                            options = options,
                            mstID = _pack.ID.Value,
                            areaID = StaticValueManager.GetInstant().AreaMasters.FirstOrDefault(x => x.Code == reqVO.areaCode).ID.Value,
                            refID = pack.LENUM, //SU : Storage Unit Number
                            ref1 = fvdt1 == null ? null : "y",  //ถ้ามีค่า approved date ให้ใส่เป็น y ถ้าไม่มีใส่ null
                            ref2 = pack.LGTYP
                        };

                        AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(packSto, buVO);
                    });
                    var opt_done = "";

                    if (packList.datas.Any(x => x.BESTQ == "S"))
                    {
                        opt_done = AMWUtil.Common.ObjectUtil.QryStrSetValue(opt_done, OptionVOConst.OPT_DONE_DES_EVENT_STATUS, StorageObjectEventStatus.HOLD.GetValueInt());
                    }
                    else if (packList.datas.Any(x => x.BESTQ == "Q"))
                    {
                        opt_done = AMWUtil.Common.ObjectUtil.QryStrSetValue(opt_done, OptionVOConst.OPT_DONE_DES_EVENT_STATUS, StorageObjectEventStatus.QC.GetValueInt());
                    }
                    else
                    {
                        opt_done = AMWUtil.Common.ObjectUtil.QryStrSetValue(opt_done, OptionVOConst.OPT_DONE_DES_EVENT_STATUS, StorageObjectEventStatus.RECEIVED.GetValueInt());
                    }
                    /*var BESTQ = packList.datas.Select(x => x.BESTQ).Distinct().First();

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
                    */
                    AWMSEngine.ADO.DataADO.GetInstant().UpdateByID<amt_StorageObject>(baseStoID, buVO,
                        new KeyValuePair<string, object>[] {
                        new KeyValuePair<string, object>("Options", opt_done)
                        });
                }

                var mapsto = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(baseStoID, StorageObjectType.BASE, false, true, buVO);
                return mapsto;
            }
        }

        private SapResponse<ZSWMRF001_OUT_SU> GetObjectFromSAP(string barcode, VOCriteria buVO)
        {
            var res = SAPInterfaceADO.GetInstant().ZWMRF001(barcode, buVO);
            if (res.datas != null)
            {
                if (res.datas.Any(x => !string.IsNullOrWhiteSpace(x.ERR_MSG)))
                {
                    throw new AMWException(buVO.Logger, AMWExceptionCode.S0001, res.datas.Find(x => !string.IsNullOrWhiteSpace(x.ERR_MSG)).ERR_MSG);
                }
            }
            else
            {
                throw new AMWException(buVO.Logger, AMWExceptionCode.S0001, res.message);
            }

            res.datas.ForEach(x => {
                if (x.LENUM == "(test)")
                {
                    x.LENUM = barcode;
                }
            });

            return res;
        }
    }
}
