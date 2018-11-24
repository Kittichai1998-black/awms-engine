using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.ADO;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business
{
    public class ScanMapStoV2 : BaseEngine<ScanMapStoV2.TReq, StorageObjectCriteria>
    {
        private StorageObjectADO ADOSto = ADO.StorageObjectADO.GetInstant();

        public class TReq
        {
            public string scanCode;
            public string batch;
            public string lot;
            public int amount;
            public long? warehouseID;
            public long? areaID;
            public VirtualMapSTOModeType mode;
            public VirtualMapSTOActionType action;
            public List<KeyValuePair<string, string>> options;
            public StorageObjectCriteria mapsto;
        }
        protected override StorageObjectCriteria ExecuteEngine(TReq reqVO)
        {
            StorageObjectCriteria mapsto = null;
            if (reqVO.mapsto == null)
            {
                mapsto = this.ExecFirstScan(reqVO);
            }
            else
            {
                mapsto = this.ExecNextScan(reqVO);
            }

            this.SetWeiAndQty(mapsto);

            return mapsto;
        }

        private StorageObjectCriteria GenerateStoCrit(BaseEntitySTD obj, long ObjectSize_ID, TReq reqVO)
        {
            var objSize = this.StaticValue.ObjectSizes.Find(x => x.ID == ObjectSize_ID);
            var res = new StorageObjectCriteria()
            {
                id = null,
                mstID = obj.ID,
                code = obj.Code,
                name = obj.Name,
                type = obj is ams_BaseMaster ? StorageObjectType.BASE : obj is ams_AreaLocationMaster ? StorageObjectType.LOCATION : StorageObjectType.PACK,

                parentID = null,
                parentType = null,

                areaID = reqVO.areaID.Value,
                warehouseID = reqVO.warehouseID.Value,
                lot = reqVO.lot,
                batch = reqVO.batch,

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
                eventStatus = StorageObjectEventStatus.IDEL,
                isFocus = obj is ams_PackMaster ? false : true,

            };
            return res;
        }
        private StorageObjectCriteria ExecFirstScan(TReq reqVO)
        {
            StorageObjectCriteria mapsto = this.ADOSto.Get(reqVO.scanCode, reqVO.warehouseID, reqVO.areaID, true, true, this.BuVO);

            if (mapsto == null)
            {
                ams_PackMaster pm = ADO.DataADO.GetInstant().SelectByCodeActive<ams_PackMaster>(reqVO.scanCode, this.BuVO);
                ams_BaseMaster bm = pm != null ? null : ADO.DataADO.GetInstant().SelectByCodeActive<ams_BaseMaster>(reqVO.scanCode, this.BuVO);
                ams_AreaLocationMaster alm = bm != null ? null : ADO.DataADO.GetInstant().SelectByCodeActive<ams_AreaLocationMaster>(reqVO.scanCode, this.BuVO);
                if (bm != null)
                {
                    mapsto = this.GenerateStoCrit(bm, bm.ObjectSize_ID, reqVO);
                    this.ADOSto.PutV2(mapsto, this.BuVO);
                }
                else if (alm != null)
                {
                    mapsto = this.GenerateStoCrit(alm, bm.ObjectSize_ID, reqVO);
                }
                else if (pm != null)
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.V1002, "ต้องสแกนพาเลทหรือกล่อง ก่อนสแกนสินค้า");
                    //ADO.DocumentADO.GetInstant().ListItemCanMap(reqVO.scanCode, DocumentTypeID.GOODS_RECEIVED, this.BuVO);
                }
            }

            return mapsto;
        }

        private StorageObjectCriteria ExecNextScan(TReq reqVO)
        {
            StorageObjectCriteria mapsto = reqVO.mapsto;
            if (reqVO.action == VirtualMapSTOActionType.SELECT)
            {
                this.ActionSelect(reqVO, mapsto);
                if (mapsto.isFocus == false)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1002, mapsto.code);
            }
            else if (reqVO.action == VirtualMapSTOActionType.ADD)
            {
                this.ActionAdd(reqVO, mapsto);
            }
            else if (reqVO.action == VirtualMapSTOActionType.REMOVE)
            {
                this.ActionRemove(reqVO, mapsto);
            }

            return mapsto;
        }

        private void SetWeiAndQty(StorageObjectCriteria mapsto)
        {
            if (mapsto.mapstos.Count() > 0)
            {
                mapsto.mapstos.ForEach(x => SetWeiAndQty(x));
                mapsto.weiKG = mapsto.mapstos.Sum(x => x.weiKG);
            }
            var counts = mapsto.mapstos
                .GroupBy(x => x.objectSizeID)
                .Select(x => new { objectSizeID = x.Key, count = x.Count() })
                .ToList();
            mapsto.objectSizeMaps.ForEach(x =>
            {
                var f = counts.FirstOrDefault(y => y.objectSizeID == x.innerObjectSizeID);
                if (f != null) x.quantity = f.count;
                else x.quantity = 0;
            });
        }

        /***********************************/
        /***********************************/
        /***********************************/
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
            string a = null;
            int aa = int.Parse(a);
            ams_PackMaster pm = ADO.DataADO.GetInstant().SelectByCodeActive<ams_PackMaster>(reqVO.scanCode, this.BuVO);
            ams_BaseMaster bm = pm != null ? null : ADO.DataADO.GetInstant().SelectByCodeActive<ams_BaseMaster>(reqVO.scanCode, this.BuVO);
            ams_AreaLocationMaster alm = bm != null ? null : ADO.DataADO.GetInstant().SelectByCodeActive<ams_AreaLocationMaster>(reqVO.scanCode, this.BuVO);

            if (alm != null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "ไม่สามารถเพิ่ม Location '" + reqVO.scanCode + "' บน '" + firstMapSto.type + "' ลงไปได้");
            if (pm == null && bm == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "ไม่พบพาเลท หรือ สินค้า รหัส '" + reqVO.scanCode + "'");


            if (reqVO.mode == VirtualMapSTOModeType.REGISTER)
            {
                //StorageObjectCriteria registMapSto = null;
                if(pm != null)
                {
                    long? docItemID = null;
                    if (this.StaticValue.IsFeature(FeatureCode.IB0100))
                    {
                        var docItemCanMaps = ADO.DocumentADO.GetInstant().ListItemCanMap(pm.Code, DocumentTypeID.GOODS_RECEIVED, reqVO.batch, reqVO.lot, this.BuVO);
                        if (docItemCanMaps == null || docItemCanMaps.Count == 0)
                            throw new AMWException(this.Logger, AMWExceptionCode.V2001, "ไม่พบเอกสาร Goods Recevie");
                        var docItemCanMap = docItemCanMaps.FirstOrDefault(x => reqVO.amount <= (x.MaxQty - x.Qty));
                        if(docItemCanMap == null)
                            throw new AMWException(this.Logger, AMWExceptionCode.V2001, "จำนวนรับเข้าคงเหลือจาก Goods Recevie ไม่ถูกต้อง");
                        docItemID = docItemCanMap.DocumentItem_ID;
                    }
                    List<long> mapDocByStoIDs = new List<long>();
                    for(int i = 0; i < reqVO.amount; i++)
                    {
                        var regisMap = this.GenerateStoCrit(pm, pm.ObjectSize_ID, reqVO);

                        regisMap.parentID = firstMapSto.id;
                        regisMap.parentType = firstMapSto.type;
                        regisMap.areaID = firstMapSto.areaID;
                        regisMap.warehouseID = firstMapSto.warehouseID;
                        this.ADOSto.PutV2(regisMap, this.BuVO);

                        firstMapSto.mapstos.Add(regisMap);
                        mapDocByStoIDs.Add(regisMap.id.Value);
                    }
                    if (docItemID.HasValue)
                        ADO.DocumentADO.GetInstant().MappingSTO(docItemID.Value, mapDocByStoIDs, this.BuVO);
                }
                else if(bm != null)
                {
                    StorageObjectCriteria regisMap = ADO.StorageObjectADO.GetInstant()
                        .Get(reqVO.scanCode, reqVO.warehouseID, reqVO.areaID, false, false, this.BuVO);
                    
                    if (regisMap == null)
                        regisMap = this.GenerateStoCrit(bm, bm.ObjectSize_ID, reqVO);

                    regisMap.parentID = firstMapSto.id;
                    regisMap.parentType = firstMapSto.type;
                    regisMap.areaID = firstMapSto.areaID;
                    regisMap.warehouseID = firstMapSto.warehouseID;
                    this.ADOSto.PutV2(regisMap, this.BuVO);

                    firstMapSto.mapstos.Add(regisMap);

                }
            }
            else if (reqVO.mode == VirtualMapSTOModeType.TRANSFER)
            {

                var countStoFree = ADO.StorageObjectADO.GetInstant()
                                    .GetFreeCount(reqVO.scanCode, reqVO.warehouseID, reqVO.areaID, reqVO.batch, reqVO.lot, true, this.BuVO);

                if (reqVO.amount > countStoFree)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1002, "จำนวนที่ต้องการโอนย้าย '" + reqVO.amount + "' มีมากกว่าจำนวนที่อยู่ในระบบ '" + countStoFree + "' ");

                for(int i = 0; i < reqVO.amount; i++)
                {
                    var transferMapSto = ADO.StorageObjectADO.GetInstant()
                                    .GetFree(reqVO.scanCode, reqVO.warehouseID, reqVO.areaID, reqVO.batch, reqVO.lot, true, true,  this.BuVO);

                    transferMapSto.parentID = firstMapSto.id;
                    transferMapSto.parentType = firstMapSto.type;
                    transferMapSto.areaID = firstMapSto.areaID;
                    transferMapSto.warehouseID = firstMapSto.warehouseID;
                    this.ADOSto.PutV2(transferMapSto, this.BuVO);

                    foreach (var sto in transferMapSto.ToTreeList())
                    {
                        if(sto.areaID != firstMapSto.areaID || sto.warehouseID != firstMapSto.warehouseID)
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
        private void ActionRemove(
            TReq reqVo,
            StorageObjectCriteria mapsto)
        {
            var msf = GetMapStoLastFocus(mapsto);

            if (reqVo.mode == VirtualMapSTOModeType.REGISTER && msf.mapstos.Count(x => x.code == reqVo.scanCode && x.eventStatus == StorageObjectEventStatus.IDEL) < reqVo.amount)
                throw new AMWUtil.Exception.AMWException(this.Logger, AMWExceptionCode.V1002, "ไม่พบรายการที่ต้องการนำออก / รายการที่จะนำออกต้องเป็นรายการที่ยังไม่ได้รับเข้าเท่านั้น");
            else if (msf.mapstos.Count(x => x.code == reqVo.scanCode) < reqVo.amount)
                throw new AMWUtil.Exception.AMWException(this.Logger, AMWExceptionCode.V1002, "ไม่พบรายการที่ต้องการนำออก");

            var mapstos = msf.mapstos.OrderBy(x => x.eventStatus).ThenByDescending(x => x.id);
            for (int i = 0; i < reqVo.amount; i++)
            {
                var rmItem = mapstos.FirstOrDefault(x => x.code == reqVo.scanCode);
                rmItem.parentID = null;
                rmItem.parentType = null;
                ADOSto.Update(rmItem, msf.areaID, this.BuVO);
                //ADOSto.Put(rmItem, null, null, this.BuVO);
                msf.mapstos.Remove(rmItem);
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
