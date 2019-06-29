using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.ADO;
using AWMSEngine.Common;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business
{
    public class ScanMapStoNoDoc : BaseEngine<ScanMapStoNoDoc.TReq, StorageObjectCriteria>
    {
        private StorageObjectADO ADOSto = ADO.StorageObjectADO.GetInstant();

        public class TReq
        {
            public long? rootID;
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
        }
        protected override StorageObjectCriteria ExecuteEngine(TReq reqVO)
        {
            StorageObjectCriteria mapsto = null;

            mapsto = this.ExecScan(reqVO);

            if(mapsto != null)
                this.SetQty(mapsto);

            return mapsto;
        }

        private StorageObjectCriteria GenerateStoCrit(BaseEntitySTD obj, long ObjectSize_ID, StorageObjectCriteria parentMapsto, TReq reqVO)
        {
            var objSize = this.StaticValue.ObjectSizes.Find(x => x.ID == ObjectSize_ID);
            var objType = obj is ams_BaseMaster ? StorageObjectType.BASE : obj is ams_AreaLocationMaster ? StorageObjectType.LOCATION : StorageObjectType.PACK;

            ams_UnitType trueUnit = null;
            long? skuID = null;
            if (objType == StorageObjectType.PACK)
            {
                trueUnit = this.StaticValue.UnitTypes.FirstOrDefault(x => x.ID == ((ams_PackMaster)obj).UnitType_ID);
                skuID = ((ams_PackMaster)obj).SKUMaster_ID;
            }
            else if (objType == StorageObjectType.BASE)
                trueUnit = this.StaticValue.UnitTypes.FirstOrDefault(x => x.ID == ((ams_BaseMaster)obj).UnitType_ID);
            else if (objType == StorageObjectType.LOCATION)
                trueUnit = this.StaticValue.UnitTypes.FirstOrDefault(x => x.ID == ((ams_AreaLocationMaster)obj).UnitType_ID);

            if (trueUnit == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Incorrect UnitType");
            

            var baseUnit = objType == StorageObjectType.PACK ?
                this.StaticValue.ConvertToBaseUnitByPack(reqVO.scanCode, reqVO.amount, trueUnit.ID.Value) : null;
            StorageObjectType? parrentType = null;
            if (parentMapsto != null)
                parrentType = parentMapsto.type;

            ams_AreaLocationMaster alm  = ADO.DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>(
                new KeyValuePair<string, object>[] {
                    new KeyValuePair<string,object>("Code",reqVO.locationCode),
                    new KeyValuePair<string,object>("AreaMaster_ID",reqVO.areaID),
                    new KeyValuePair<string,object>("Status", EntityStatus.ACTIVE)
                }, this.BuVO).FirstOrDefault();
            if (!String.IsNullOrEmpty(reqVO.locationCode) && alm == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Location Code '" + reqVO.locationCode + "' not found");

            var res = new StorageObjectCriteria()
            {
                id = null,
                mstID = obj.ID,
                code = obj.Code,
                name = obj.Name,
                type = objType,
                skuID = skuID,
                productDate = reqVO.productDate,

                parentID = parentMapsto != null ? parentMapsto.id : alm != null ? alm.ID : null,
                parentType = parrentType != null ? parrentType : StorageObjectType.LOCATION,

                areaID = parentMapsto != null ? parentMapsto.areaID : reqVO.areaID.Value,
                warehouseID = parentMapsto != null ? parentMapsto.warehouseID : reqVO.warehouseID.Value,
                orderNo = reqVO.orderNo,
                lot = reqVO.lot,
                batch = reqVO.batch,

                qty = reqVO.amount,
                unitID = trueUnit.ID.Value,
                unitCode = trueUnit.Code,


                baseQty = baseUnit != null ? baseUnit.baseQty : 1,
                baseUnitID = baseUnit != null ? baseUnit.baseUnitType_ID : trueUnit.ID.Value,
                baseUnitCode = baseUnit != null ?
                                    this.StaticValue.UnitTypes.First(x => x.ID == baseUnit.baseUnitType_ID).Code : trueUnit.Code,

                weiKG = null,
                widthM = null,
                heightM = null,
                lengthM = null,

                options = reqVO.options,

                maxWeiKG = objSize.MaxWeigthKG,
                minWeiKG = objSize.MinWeigthKG,
                objectSizeID = objSize.ID.Value,
                objectSizeName = objSize.Name,
                objectSizeMaps = objSize.ObjectSizeInners.Select(x => new StorageObjectCriteria.ObjectSizeMap()
                {
                    innerObjectSizeID = x.InnerObjectSize_ID,
                    innerObjectSizeName = this.StaticValue.ObjectSizes.Find(y => y.ID == x.InnerObjectSize_ID).Name,
                    outerObjectSizeID = x.ID.Value,
                    outerObjectSizeName = x.Name,
                    maxQuantity = x.MaxQuantity,
                    minQuantity = x.MinQuantity,
                    quantity = 0
                }).ToList(),
                mapstos = new List<StorageObjectCriteria>(),
                eventStatus = StorageObjectEventStatus.NEW,
                isFocus = obj is ams_PackMaster ? false : true,

            };
            res.groupSum = StorageObjectCriteria.CreateGroupSum(res);
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
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "'" + reqVO.scanCode + "' Not Found");
                    ams_PackMaster pm = ADO.MasterADO.GetInstant().GetPackMasterByPack(reqVO.scanCode, this.BuVO);
                    ams_BaseMaster bm = pm != null ? null : ADO.DataADO.GetInstant().SelectByCodeActive<ams_BaseMaster>(reqVO.scanCode, this.BuVO);
                    ams_AreaLocationMaster alm = bm != null ? null : ADO.DataADO.GetInstant().SelectByCodeActive<ams_AreaLocationMaster>(reqVO.scanCode, this.BuVO);
                    if (bm != null)
                    {
                        mapsto = this.GenerateStoCrit(bm, bm.ObjectSize_ID, null, reqVO);
                        this.ADOSto.PutV2(mapsto, this.BuVO);
                    }
                    else if (alm != null)
                    {
                        mapsto = this.GenerateStoCrit(alm, bm.ObjectSize_ID, null, reqVO);
                    }
                    else if (pm != null)
                    {
                        throw new AMWException(this.Logger, AMWExceptionCode.V1002, "Please scan pallet or box code then scan product code");
                    }
                    else
                    {
                        throw new AMWException(this.Logger, AMWExceptionCode.V1002, reqVO.scanCode + " not found");
                    }
                }
                else
                {
                    if (mapsto.warehouseID != reqVO.warehouseID)
                        throw new AMWException(this.Logger, AMWExceptionCode.V1002, "Warehouse doesn't match");
                    if (reqVO.action != VirtualMapSTOActionType.SELECT)
                        if (mapsto.areaID != reqVO.areaID)
                            throw new AMWException(this.Logger, AMWExceptionCode.V1002, "Area doesn't match");
                }

            }
            else
            {
                mapsto = this.ADOSto.Get(reqVO.rootID.Value, StorageObjectType.BASE, reqVO.isRoot, true, this.BuVO);
                if (mapsto == null)
                    throw new AMWUtil.Exception.AMWException(this.Logger, AMWExceptionCode.V1002, reqVO.scanCode + " not found");
                if (mapsto.warehouseID != reqVO.warehouseID)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1002, "Warehouse doesn't match");

                if (mapsto.areaID != reqVO.areaID)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1002, "Area doesn't match");

                if (reqVO.action == VirtualMapSTOActionType.SELECT)
                {
                    this.ActionSelect(reqVO, mapsto);
                    if (mapsto.isFocus == false)
                        throw new AMWException(this.Logger, AMWExceptionCode.V1002, mapsto.code);
                }
                else if (reqVO.action == VirtualMapSTOActionType.ADD)
                {
                    if (!mapsto.eventStatus.In(StorageObjectEventStatus.NEW, StorageObjectEventStatus.RECEIVING, StorageObjectEventStatus.REJECTED))
                        throw new AMWException(this.Logger, AMWExceptionCode.B0001, "Can't add product in base that it has status is " + mapsto.eventStatus);

                    this.ActionAdd(reqVO, mapsto);
                }
                else if (reqVO.action == VirtualMapSTOActionType.REMOVE)
                {
                    if (!mapsto.eventStatus.In(StorageObjectEventStatus.NEW, StorageObjectEventStatus.RECEIVING, StorageObjectEventStatus.REJECTED))
                        throw new AMWException(this.Logger, AMWExceptionCode.B0001, "Can't remove product from base that it has status is " + mapsto.eventStatus);

                    this.ActionRemove(reqVO, mapsto);
                    mapsto = this.ADOSto.Get(reqVO.rootID.Value, StorageObjectType.BASE, reqVO.isRoot, true, this.BuVO);
                }
            }
            return mapsto;
        }

        private void SetQty(StorageObjectCriteria mapsto)
        {
            mapsto.objectSizeMaps.ForEach(x =>
            {
                x.quantity = mapsto.mapstos.Count(y => y.objectSizeID == x.outerObjectSizeID);
            });
        }

        private bool ActionSelect(
            TReq reqVO,
            StorageObjectCriteria mapsto)
        {
            if (mapsto.type != StorageObjectType.PACK)
                mapsto.isFocus = mapsto.code.Equals(reqVO.scanCode);
            mapsto.mapstos.ForEach(x =>
            {
                mapsto.isFocus = mapsto.type != StorageObjectType.PACK & (ActionSelect(reqVO, x) | mapsto.isFocus);
            });
            return mapsto.isFocus;
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
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, reqVO.scanCode + " can't add location on " + firstMapSto.type);
            if (pm == null && bm == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, reqVO.scanCode + " not found");

            if (reqVO.mode == VirtualMapSTOModeType.REGISTER)
            {
                if (pm != null)
                {
                    var regisMap = this.GenerateStoCrit(pm, pm.ObjectSize_ID, firstMapSto, reqVO);
                    
                    var matchStomap = firstMapSto.mapstos.FirstOrDefault(x => x.groupSum == regisMap.groupSum);
                    if(matchStomap == null)
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
                        .Get(reqVO.scanCode, reqVO.warehouseID, reqVO.areaID, false, false, this.BuVO);

                    if (regisMap == null)
                        regisMap = this.GenerateStoCrit(bm, bm.ObjectSize_ID, firstMapSto, reqVO);

                    this.ADOSto.PutV2(regisMap, this.BuVO);

                    firstMapSto.mapstos.Add(regisMap);

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
            var msf = GetMapStoLastFocus(mapsto);
            if (reqVo.mode == VirtualMapSTOModeType.REGISTER && msf.eventStatus != StorageObjectEventStatus.NEW)
                throw new AMWUtil.Exception.AMWException(this.Logger, AMWExceptionCode.V1002, "ไม่พบรายการที่ต้องการนำออก / รายการที่จะนำออกต้องเป็นรายการที่ยังไม่ได้รับเข้าเท่านั้น");
            if (reqVo.scanCode == mapsto.code)
            {
                AWMSEngine.ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(reqVo.rootID.Value, null, null, StorageObjectEventStatus.REMOVED, this.BuVO);
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
                if (qty > 0)
                {
                    var baseUnit = this.StaticValue.ConvertToBaseUnitByPack(reqVo.scanCode, qty, rmItem.unitID);
                    rmItem.qty = baseUnit.qty;
                    rmItem.baseQty = baseUnit.baseQty;
                    rmItem.options = reqVo.options;
                    ADOSto.PutV2(rmItem, this.BuVO);
                }
                else
                {
                    rmItem.eventStatus = StorageObjectEventStatus.REMOVED;
                    rmItem.areaID = msf.areaID.Value;
                    ADOSto.PutV2(rmItem, this.BuVO);
                    msf.mapstos.Remove(rmItem);
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
