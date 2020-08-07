using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.ADO;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;

namespace AWMSEngine.Engine.V2.Business
{
    public class ScanMapStoNoDoc : BaseEngine<ScanMapStoNoDoc.TReq, StorageObjectCriteria>
    {
        private StorageObjectADO ADOSto = ADO.StorageObjectADO.GetInstant();

        public class TReq
        {
            public long? rootID;
            public StorageObjectType? rootType = StorageObjectType.BASE;
            public string scanCode;
            public string orderNo;
            public string batch;
            public string lot;
            public decimal amount;
            public string unitCode;
            public DateTime? productDate;
            public long? warehouseID;
            public long? areaID;
            public string locationCode;
            public string options;
            public bool isRoot = true;
            public VirtualMapSTOModeType mode;
            public VirtualMapSTOActionType action;
            public List<string> validateSKUTypeCodes;
            public string rootOptions;
        }
        protected override StorageObjectCriteria ExecuteEngine(TReq reqVO)
        {
            StorageObjectCriteria mapsto = null;

            if (reqVO.amount == 0)
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "จำนวนสินค้ามีค่าเป็น 0 ไม่สามารถรับเข้าได้");

            mapsto = this.ExecScan(reqVO);

            return mapsto;
        }
        private void CheckSKUType(TReq reqVO, ams_PackMaster pm)
        {
            if (reqVO.validateSKUTypeCodes != null && reqVO.validateSKUTypeCodes.Count > 0)
            {
                ams_SKUMaster sm = ADO.DataADO.GetInstant().SelectByID<ams_SKUMaster>(pm.SKUMaster_ID, this.BuVO);
                if (sm == null)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่มี SKU ในระบบ");

                ams_SKUMasterType smt = this.StaticValue.SKUMasterTypes.Find(x => x.ID == sm.SKUMasterType_ID);
                SKUGroupType smt_GroupType = smt.GroupType;
                if (!reqVO.validateSKUTypeCodes.Any(x => x == smt_GroupType.ToString()))
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "SKU Type ไม่ถูกต้อง");
            }
        }
        private StorageObjectCriteria NewStorageObjectCriteria(BaseEntitySTD obj, StorageObjectCriteria parentMapsto, TReq reqVO)
        {
            ams_AreaLocationMaster alm = null;


            var objType = obj is ams_BaseMaster ? StorageObjectType.BASE :
                            obj is ams_AreaLocationMaster ? StorageObjectType.LOCATION :
                                StorageObjectType.PACK;
            StorageObjectCriteria res = null;
            if (objType == StorageObjectType.LOCATION)
                res = StorageObjectCriteria.NewLocation((ams_AreaLocationMaster)obj, this.StaticValue);
            else if (objType == StorageObjectType.BASE)
                res = StorageObjectCriteria.NewBase((ams_BaseMaster)obj, reqVO.areaID ?? 0, reqVO.options, this.StaticValue);
            else if (objType == StorageObjectType.PACK)
                res = StorageObjectCriteria.NewPack(parentMapsto, (ams_PackMaster)obj, reqVO.amount, reqVO.unitCode, reqVO.batch, reqVO.lot, reqVO.orderNo, reqVO.options, reqVO.productDate, this.StaticValue);

            if (!String.IsNullOrEmpty(reqVO.locationCode) && parentMapsto == null)
            {
                alm = ADO.DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>(
                new KeyValuePair<string, object>[] {
                    new KeyValuePair<string,object>("Code",reqVO.locationCode),
                    new KeyValuePair<string,object>("AreaMaster_ID",reqVO.areaID),
                    new KeyValuePair<string,object>("Status", EntityStatus.ACTIVE)
                }, this.BuVO).FirstOrDefault();
                if (alm == null)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่มี Location : " + reqVO.locationCode);

                res.parentID = alm.ID;
                res.parentType = StorageObjectType.LOCATION;
            }
            return res;
        }
        private StorageObjectCriteria ExecScan(TReq reqVO)
        {
            StorageObjectCriteria mapsto = null;
            if (reqVO.rootID == null)
            {
                mapsto = this.ADOSto.Get(reqVO.scanCode, null, null, reqVO.isRoot, true, this.BuVO);
                if (mapsto == null)
                {
                    if (reqVO.action == VirtualMapSTOActionType.SELECT || reqVO.action == VirtualMapSTOActionType.REMOVE)
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ : " + reqVO.scanCode);
                    ams_PackMaster pm = ADO.MasterADO.GetInstant().GetPackMasterByPack(reqVO.scanCode, this.BuVO);
                    //this.CheckSKUType(reqVO, pm);

                    ams_BaseMaster bm = pm != null ? null : ADO.DataADO.GetInstant().SelectByCodeActive<ams_BaseMaster>(reqVO.scanCode, this.BuVO);
                    ams_AreaLocationMaster alm = bm != null ? null : ADO.DataADO.GetInstant().SelectByCodeActive<ams_AreaLocationMaster>(reqVO.scanCode, this.BuVO);
                    if (bm != null)
                    {
                        mapsto = this.NewStorageObjectCriteria(bm, null, reqVO);
                        if (reqVO.rootOptions != null)
                        {
                            string options = mapsto.options;
                            var listkeyRoot = ObjectUtil.QryStrToKeyValues(reqVO.rootOptions);
                            if (listkeyRoot != null && listkeyRoot.Count > 0)
                            {
                                foreach (KeyValuePair<string, string> v in listkeyRoot)
                                {
                                    options = ObjectUtil.QryStrSetValue(options, v.Key, v.Value);
                                }
                            }

                            mapsto.options = options;
                            this.ADOSto.PutV2(mapsto, this.BuVO);
                        }

                        this.ADOSto.PutV2(mapsto, this.BuVO);
                    }
                    else if (alm != null)
                    {
                        mapsto = this.NewStorageObjectCriteria(alm, null, reqVO);
                    }
                    else if (pm != null)
                    {
                        throw new AMWException(this.Logger, AMWExceptionCode.V1002, "กรุณาแสดงพาเลทหรือกล่อง แล้วแสกนสินค้า");
                    }
                    else
                    {
                        throw new AMWException(this.Logger, AMWExceptionCode.V1002, "ไม่พบ : " + reqVO.scanCode);
                    }
                }
                else
                {
                    if (mapsto.warehouseID != reqVO.warehouseID)
                        throw new AMWException(this.Logger, AMWExceptionCode.V1002, "Warehouse ไม่ถูกต้อง");
                    if (reqVO.action != VirtualMapSTOActionType.SELECT)
                        if (mapsto.areaID != reqVO.areaID)
                            throw new AMWException(this.Logger, AMWExceptionCode.V1002, "Area ไม่ถูกต้อง");
                }

            }
            else
            {
                mapsto = this.ADOSto.Get(reqVO.rootID.Value, reqVO.rootType.Value, reqVO.isRoot, true, this.BuVO);

                var stoBase = new StorageObjectCriteria();
                if (reqVO.rootType.Value != StorageObjectType.LOCATION)
                {
                    stoBase = mapsto.ToTreeList().Find(x => x.type == StorageObjectType.BASE && x.id == reqVO.rootID.Value);
                    if (stoBase.id == null)
                        throw new AMWUtil.Exception.AMWException(this.Logger, AMWExceptionCode.V1002, "ไม่พบ " + reqVO.scanCode);
                }

                if (mapsto == null)
                    throw new AMWUtil.Exception.AMWException(this.Logger, AMWExceptionCode.V1002, "ไม่พบ " + reqVO.scanCode);

                if (reqVO.rootOptions != null)
                {

                    string options = mapsto.options;
                    var listkeyRoot = ObjectUtil.QryStrToKeyValues(reqVO.rootOptions);
                    if (listkeyRoot != null && listkeyRoot.Count > 0)
                    {
                        foreach (KeyValuePair<string, string> v in listkeyRoot)
                        {
                            options = ObjectUtil.QryStrSetValue(options, v.Key, v.Value);
                        }
                    }

                    mapsto.options = options;
                    this.ADOSto.PutV2(mapsto, this.BuVO);
                }

                if (mapsto.warehouseID != reqVO.warehouseID)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1002, "Warehouse ไม่ถูกต้อง");

                if (mapsto.areaID != reqVO.areaID)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1002, "Area ไม่ถูกต้อง");

                if (reqVO.action == VirtualMapSTOActionType.SELECT)
                {
                    this.ActionSelect(reqVO, mapsto);
                    if (mapsto.isFocus == false)
                        throw new AMWException(this.Logger, AMWExceptionCode.V1002, mapsto.code);
                }
                else if (reqVO.action == VirtualMapSTOActionType.ADD)
                {
                    if (stoBase.id != null)
                    {
                        if (!stoBase.eventStatus.In(StorageObjectEventStatus.NEW, StorageObjectEventStatus.RECEIVING, StorageObjectEventStatus.CANCELED))
                            throw new AMWException(this.Logger, AMWExceptionCode.B0001, "ไม่สามารถ'เพิ่ม'สินค้าในพาเลทได้เนื่องจาก EventStatus เป็น " + stoBase.eventStatus);

                    }

                    this.ActionAdd(reqVO, mapsto);

                }
                else if (reqVO.action == VirtualMapSTOActionType.REMOVE)
                {

                    if (stoBase.id != null)
                    {
                        if (!stoBase.eventStatus.In(StorageObjectEventStatus.NEW, StorageObjectEventStatus.RECEIVING, StorageObjectEventStatus.CANCELED))
                            throw new AMWException(this.Logger, AMWExceptionCode.B0001, "ไม่สามารถ'ลบ'สินค้าในพาเลทได้เนื่องจาก EventStatus เป็น" + stoBase.eventStatus);
                    }
                    this.ActionRemove(reqVO, mapsto);
                    mapsto = this.ADOSto.Get(reqVO.rootID.Value, reqVO.rootType.Value, reqVO.isRoot, true, this.BuVO);
                }
            }
            return mapsto;
        }

        private bool ActionSelect(
            TReq reqVO,
            StorageObjectCriteria mapsto)
        {
            if (mapsto.type != StorageObjectType.PACK)
                mapsto.isFocus = mapsto.code.ToUpper().Equals(reqVO.scanCode.ToUpper());
            mapsto.mapstos.ForEach(x =>
            {
                mapsto.isFocus = mapsto.type != StorageObjectType.PACK & (ActionSelect(reqVO, x) | mapsto.isFocus);
            });
            return mapsto.isFocus;
        }
        private void CheckCartonNo(TReq reqVO, StorageObjectCriteria mapsto, ams_PackMaster pm)
        {
            ams_SKUMaster sm = ADO.DataADO.GetInstant().SelectByID<ams_SKUMaster>(pm.SKUMaster_ID, this.BuVO);
            if (sm == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ SKU");

            ams_SKUMasterType smt = this.StaticValue.SKUMasterTypes.Find(x => x.ID == sm.SKUMasterType_ID);
            SKUGroupType smt_GroupType = smt.GroupType;
            if (smt.GroupType == SKUGroupType.FG)
            {
                var sto_pack = mapsto.ToTreeList().Find(x => x.type == StorageObjectType.PACK);
                var stopack = new List<amt_StorageObject>() { };
                if (sto_pack != null)
                {
                    stopack = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>(
                                   new SQLConditionCriteria[] {
                                            new SQLConditionCriteria("ID", sto_pack.id.Value, SQLOperatorType.NOTEQUALS),
                                            new SQLConditionCriteria("Code", reqVO.scanCode, SQLOperatorType.EQUALS),
                                            new SQLConditionCriteria("OrderNo", reqVO.orderNo, SQLOperatorType.EQUALS),
                                            new SQLConditionCriteria("Status", "0,1", SQLOperatorType.IN)
                                   }, this.BuVO);
                }
                else
                {
                    stopack = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>(
                                   new SQLConditionCriteria[] {
                                            new SQLConditionCriteria("Code", reqVO.scanCode, SQLOperatorType.EQUALS),
                                            new SQLConditionCriteria("OrderNo", reqVO.orderNo, SQLOperatorType.EQUALS),
                                            new SQLConditionCriteria("Status", "0,1", SQLOperatorType.IN)
                                   }, this.BuVO);
                }

                if (stopack != null && stopack.Count() > 0)
                {
                    var req_Carton = ObjectUtil.QryStrGetValue(reqVO.options, OptionVOConst.OPT_CARTON_NO);
                    if (req_Carton.Length > 0)
                    {
                        var temp_carton = stopack.Select(x => ObjectUtil.QryStrGetValue(x.Options, OptionVOConst.OPT_CARTON_NO)).ToList();
                        foreach (var car in temp_carton)
                        {
                            var carton_match = RangeNumUtil.IntersectRangeNum(req_Carton, car);
                            if (carton_match.Length > 0)
                            {
                                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "เลข Carton No. ซ้ำกับพาเลทอื่นที่มี SI. และ Reorder เดียวกัน");
                                //"Carton No. must be unique to other pallets in same SI. and Reorder No."
                            }
                        }
                    }
                    else
                    {
                        throw new AMWException(this.Logger, AMWExceptionCode.V1002, "กรุณากรอกเลข Carton No.");
                    }
                }
            }
        }
        private void ActionAdd(
            TReq reqVO,
            StorageObjectCriteria mapsto)
        {
            var firstMapSto = this.GetMapStoLastFocus(mapsto);
            ams_PackMaster pm = ADO.MasterADO.GetInstant().GetPackMasterByPack(reqVO.scanCode, this.BuVO);

            ams_BaseMaster bm = pm != null ? null : ADO.DataADO.GetInstant().SelectByCodeActive<ams_BaseMaster>(reqVO.scanCode, this.BuVO);
            ams_AreaLocationMaster alm = bm != null ? null : ADO.DataADO.GetInstant().SelectByCodeActive<ams_AreaLocationMaster>(reqVO.scanCode, this.BuVO);

            if (alm != null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, reqVO.scanCode + " ไม่สามารถเพิ่ม location บน " + firstMapSto.type);
            if (pm == null && bm == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "ไม่พบ : " + reqVO.scanCode);

            if (reqVO.mode == VirtualMapSTOModeType.REGISTER)
            {
                if (pm != null)
                {
                    this.CheckSKUType(reqVO, pm);

                    this.CheckCartonNo(reqVO, mapsto, pm);

                    var regisMap = this.NewStorageObjectCriteria(pm, firstMapSto, reqVO);

                    var matchStomap = firstMapSto.mapstos.FirstOrDefault(x => x.GetCheckSum() == regisMap.GetCheckSum());
                    if (matchStomap == null)
                    {
                        this.ADOSto.PutV2(regisMap, this.BuVO);
                        firstMapSto.mapstos.Add(regisMap);
                    }
                    else
                    {
                        matchStomap.options = regisMap.options == null ? matchStomap.options : regisMap.options;
                        matchStomap.qty += regisMap.qty;
                        matchStomap.baseQty += regisMap.baseQty;
                        this.ADOSto.PutV2(matchStomap, this.BuVO);
                    }

                }
                else if (bm != null)
                {
                    StorageObjectCriteria regisMap = ADO.StorageObjectADO.GetInstant()
                        .Get(reqVO.scanCode, reqVO.warehouseID, reqVO.areaID, false, true, this.BuVO);

                    if (regisMap == null)
                    {
                        regisMap = this.NewStorageObjectCriteria(bm, firstMapSto, reqVO);
                    }
                    else
                    {
                        if (firstMapSto.id != regisMap.id)
                        {
                            regisMap.parentID = firstMapSto.id;
                            regisMap.parentType = firstMapSto.type;
                        }
                    }
                    this.ADOSto.PutV2(regisMap, this.BuVO);

                    firstMapSto.mapstos = firstMapSto.mapstos.FindAll(x => x.id != regisMap.id);
                    firstMapSto.mapstos.Add(regisMap);
                    firstMapSto.mapstos = firstMapSto.mapstos.OrderBy(x => x.id).ToList();

                }

            }
            else if (reqVO.mode == VirtualMapSTOModeType.TRANSFER)
            {
                //throw new Exception("ปิด Module Transfer");
                var countStoFree = ADO.StorageObjectADO.GetInstant()
                                    .GetFreeCount(reqVO.scanCode, reqVO.warehouseID, reqVO.areaID, reqVO.batch, reqVO.lot, true, this.BuVO);

                if (reqVO.amount > countStoFree)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1002, "จำนวนที่ต้องการโอนย้าย '" + reqVO.amount + "' มีมากกว่าจำนวนที่อยู่ในระบบ '" + countStoFree + "' ");

                for (int i = 0; i < reqVO.amount; i++)
                {
                    var transferMapSto = ADO.StorageObjectADO.GetInstant()
                                    .GetFree(reqVO.scanCode, reqVO.warehouseID, reqVO.areaID, reqVO.batch, reqVO.lot, true, true, this.BuVO);

                    transferMapSto.parentID = firstMapSto.id;
                    transferMapSto.parentType = firstMapSto.type;
                    transferMapSto.areaID = firstMapSto.areaID;
                    transferMapSto.warehouseID = firstMapSto.warehouseID;
                    this.ADOSto.PutV2(transferMapSto, this.BuVO);

                    foreach (var sto in transferMapSto.ToTreeList())
                    {
                        if (sto.areaID != firstMapSto.areaID || sto.warehouseID != firstMapSto.warehouseID)
                        {
                            transferMapSto.areaID = firstMapSto.areaID;
                            transferMapSto.warehouseID = firstMapSto.warehouseID;
                            this.ADOSto.PutV2(transferMapSto, this.BuVO);
                        }
                    }

                    firstMapSto.mapstos.Add(transferMapSto);
                }
            }
        }
        private void ActionRemove(TReq reqVo, StorageObjectCriteria mapsto)
        {
            var msf = GetMapStoLastFocus(mapsto); //กรณี root เป็น area จะลบpallet ไม่ได้
            if (msf.type != StorageObjectType.LOCATION)
                if (reqVo.mode == VirtualMapSTOModeType.REGISTER && msf.eventStatus != StorageObjectEventStatus.NEW)
                    throw new AMWUtil.Exception.AMWException(this.Logger, AMWExceptionCode.V1002, "ไม่พบรายการที่ต้องการนำออก / รายการที่จะนำออกต้องเป็นรายการที่ยังไม่ได้รับเข้าเท่านั้น");

            if (reqVo.scanCode == mapsto.code)
            {
                var checkMapsto = mapsto.ToTreeList();

                if (mapsto.eventStatus != StorageObjectEventStatus.NEW || !checkMapsto.Any(x => x.eventStatus == StorageObjectEventStatus.NEW))
                    throw new AMWUtil.Exception.AMWException(this.Logger, AMWExceptionCode.V1002, "ไม่พบรายการที่ต้องการนำออก / รายการที่จะนำออกต้องเป็นรายการที่ยังไม่ได้รับเข้าเท่านั้น");

                AWMSEngine.ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(msf.id.Value, null, null, StorageObjectEventStatus.REMOVED, this.BuVO);

                // msf.eventStatus = StorageObjectEventStatus.REMOVED;
                // msf.areaID = msf.areaID.Value;
                // ADOSto.PutV2(msf, this.BuVO);
            }
            else
            {
                var msfPack = msf.mapstos.FirstOrDefault(x => x.code == reqVo.scanCode && x.eventStatus == StorageObjectEventStatus.NEW);
                if (msfPack == null)
                    throw new AMWUtil.Exception.AMWException(this.Logger, AMWExceptionCode.V1002, "ไม่พบรายการที่ต้องการนำออก / รายการที่จะนำออกต้องเป็นรายการที่ยังไม่ได้รับเข้าเท่านั้น");
                else if (msfPack.qty < reqVo.amount)
                    throw new AMWUtil.Exception.AMWException(this.Logger, AMWExceptionCode.V1002, "Amount not enough");

                var mapstos = msf.mapstos.OrderBy(x => x.eventStatus).ThenByDescending(x => x.id);
                var rmItem = mapstos.FirstOrDefault(x => x.code == reqVo.scanCode);
                var qty = rmItem.qty -= reqVo.amount;
                this.StaticValue.LoadPackUnitConvert();
                if (qty > 0)
                {
                    var baseUnit = this.StaticValue.ConvertToBaseUnitByPack(reqVo.scanCode, qty, rmItem.unitID);
                    rmItem.qty = baseUnit.newQty;
                    rmItem.baseQty = baseUnit.baseQty;
                    rmItem.options = reqVo.options;
                    ADOSto.PutV2(rmItem, this.BuVO);
                }
                else
                {
                    if (rmItem.mapstos.Count() > 0 && !rmItem.mapstos.Any(x => x.eventStatus.In(StorageObjectEventStatus.NEW)))
                        throw new AMWUtil.Exception.AMWException(this.Logger, AMWExceptionCode.V1002, "ไม่พบรายการที่ต้องการนำออก / รายการที่จะนำออกต้องเป็นรายการที่ยังไม่ได้รับเข้าเท่านั้น");

                    AWMSEngine.ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(rmItem.id.Value, null, null, StorageObjectEventStatus.REMOVED, this.BuVO);
                    /* rmItem.eventStatus = StorageObjectEventStatus.REMOVED;
                     rmItem.areaID = msf.areaID.Value;
                     ADOSto.PutV2(rmItem, this.BuVO);
                     msf.mapstos.Remove(rmItem);*/
                }
            }
        }

        private StorageObjectCriteria GetMapStoLastFocus(StorageObjectCriteria mapsto)
        {
            var res = mapsto.mapstos.FirstOrDefault(x => x.isFocus);
            if (res != null)
                return GetMapStoLastFocus(res);
            return mapsto;
        }
        private void ClaerMapStoFocus(StorageObjectCriteria mapsto)
        {
            var res = mapsto.mapstos.FirstOrDefault(x => x.isFocus);
            if (res != null)
            {
                res.isFocus = false;
                this.ClaerMapStoFocus(res);
            }
        }
        private StorageObjectCriteria GetBaseByCode(string scanCode, StorageObjectCriteria mapsto)
        {
            if (mapsto.type == StorageObjectType.BASE && mapsto.code == scanCode)
                return mapsto;
            foreach (var ms in mapsto.mapstos)
            {
                var m = GetBaseByCode(scanCode, ms);
                if (m != null)
                    return m;
            }
            return null;
        }
    }
}