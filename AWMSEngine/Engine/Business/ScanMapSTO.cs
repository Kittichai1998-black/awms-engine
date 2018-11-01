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
    public class ScanMapSTO : BaseEngine<ScanMapSTO.TReqel, StorageObjectCriteria>
    {
        private StorageObjectADO ADOSto = ADO.StorageObjectADO.GetInstant();

        public class TReqel
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
        protected override StorageObjectCriteria ExecuteEngine(TReqel reqVO)
        {
            StorageObjectCriteria mapsto = null;
            if(reqVO.mapsto == null)
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

        private StorageObjectCriteria ExecFirstScan(TReqel reqVO)
        {
            StorageObjectCriteria mapsto = null;
            Logger.LogDebug("//สแกนครั้งแรก");
            if (reqVO.mode == VirtualMapSTOModeType.TRANSFER)
            {
                Logger.LogDebug("Transfer Mode.");
                mapsto = ADOSto.Get(reqVO.scanCode, reqVO.warehouseID, reqVO.areaID, true, true, this.BuVO);
                //if (mapsto == null)
                //    throw new AMWException(this.Logger, AMWExceptionCode.V2001, reqVO.scanCode);
            }
            if (reqVO.mode == VirtualMapSTOModeType.REGISTER || (reqVO.mode == VirtualMapSTOModeType.TRANSFER && mapsto == null))
            {
                Logger.LogDebug("Register Mode.");
                Logger.LogDebug("//หา sto ในคลัง ทั้งแบบ Free และ No Free");
                mapsto = ADOSto.Get(reqVO.scanCode, reqVO.warehouseID, reqVO.areaID, false, false, this.BuVO);
                if (mapsto == null || mapsto.type == StorageObjectType.PACK)
                {
                    int freeCount = ADOSto.GetFreeCount(reqVO.scanCode, reqVO.warehouseID, reqVO.areaID, false, reqVO.batch, reqVO.lot, this.BuVO);
                    if (freeCount < reqVO.amount && (!false && this.StaticValue.IsFeature(FeatureCode.IB0100)))
                    {
                        if (!false && ADO.DataADO.GetInstant().SelectByCodeActive<ams_PackMaster>(reqVO.scanCode, this.BuVO) != null)
                            throw new AMWException(this.Logger, AMWExceptionCode.V1002, "ไม่สามารถเพิ่มรายการสินค้าได้ เนื่องจากจำนวนที่รับเข้าเกินจากเอกสาร Received");
                        else
                            throw new AMWException(this.Logger, AMWExceptionCode.V1002, "รหัสสินค้า/พาเลท ไม่ถูกต้อง");
                    }

                    Logger.LogDebug("//ไม่พบในคลัง ให้หา sto นอกคลังแบบ Free");
                    mapsto = ADOSto.GetFree(reqVO.scanCode, reqVO.warehouseID, reqVO.areaID, false, true, this.BuVO);
                    if (mapsto != null)
                    {
                        Logger.LogDebug("//พบ sto ว่างประเภท " + mapsto.type);
                        if (!reqVO.areaID.HasValue)
                            throw new AMWException(this.Logger, AMWExceptionCode.V1001, "กรุณาเลือก Area");
                        if (!mapsto.id.HasValue)
                            ADOSto.Create(mapsto, reqVO.areaID.Value, reqVO.batch, reqVO.lot, this.BuVO);
                        else
                            ADOSto.Update(mapsto, reqVO.areaID.Value, this.BuVO);
                        Logger.LogDebug("//รับเข้าคลัง สถานะ WAIT");
                    }
                    else
                        throw new AMWException(this.Logger, AMWExceptionCode.V2001, "ไม่พบรายการในคลัง");
                }
                else if (mapsto != null)
                {
                    Logger.LogDebug("//พบในคลัง ดึงข้อมูลคลังมาแสดง");
                    mapsto = ADOSto.Get(reqVO.scanCode, reqVO.warehouseID, reqVO.areaID, true, true, this.BuVO);
                }
                /*else if (mapsto.type == StorageObjectType.PACK)
                {
                    Logger.LogDebug("//แสกนครั้งแรกไม่สามารถแสกนสินค้าโดยตรงได้ " + mapsto.type);
                    throw new AMWException(this.Logger, AMWExceptionCode.V2001, reqVO.scanCode);
                }*/
            }
            

            mapsto.isFocus = true;
            return mapsto;
        }

        private StorageObjectCriteria ExecNextScan(TReqel reqVO)
        {
            Logger.LogInfo("Get STO From Request.(Action)");
            StorageObjectCriteria mapsto = reqVO.mapsto;
            if (reqVO.action == VirtualMapSTOActionType.SELECT)
            {
                this.ActionSelect(reqVO.scanCode, mapsto);
                if (mapsto.isFocus == false)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1002, mapsto.code);
            }
            else if (reqVO.action == VirtualMapSTOActionType.ADD)
            {
                this.ActionAdd(
                    reqVO.scanCode,
                    reqVO.warehouseID,
                    reqVO.areaID,
                    reqVO.batch,
                    reqVO.lot,
                    reqVO.amount,
                    reqVO.mode == VirtualMapSTOModeType.TRANSFER,
                    reqVO.options,
                    mapsto);
            }
            else if (reqVO.action == VirtualMapSTOActionType.REMOVE)
            {
                this.ActionRemove(reqVO.mode,reqVO.scanCode, reqVO.amount, mapsto);
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
            mapsto.objectSizeMaps.ForEach(x=>
            {
                var f = counts.FirstOrDefault(y => y.objectSizeID == x.innerObjectSizeID);
                if (f != null) x.quantity = f.count;
                else x.quantity = 0;
            });
        }

        /***********************************/
        /***********************************/
        /***********************************/
        private bool ActionSelect(string scanCode, StorageObjectCriteria mapsto)
        {
            if (mapsto.type != StorageObjectType.PACK)
                mapsto.isFocus = mapsto.code.Equals(scanCode);
            mapsto.mapstos.ForEach(x =>
            {
                mapsto.isFocus = mapsto.type != StorageObjectType.PACK & (ActionSelect(scanCode, x) | mapsto.isFocus);
            });
            return mapsto.isFocus;
        }

        private void ActionAdd(string scanCode,
            long? warehouseID,
            long? areaID,
            string batch,
            string lot,
            int amount,
            bool isInStorage,
            List<KeyValuePair<string, string>> options,
            StorageObjectCriteria mapsto)
        {
            //var oldCode = this.GetMapStoLastFocus(mapsto).code;
            //mapsto = ADOSto.Get(mapsto.code, true, true, this.BuVO);
            //this.ActionSelect(oldCode, mapsto);
            var msf = this.GetMapStoLastFocus(mapsto);
            

            List<StorageObjectCriteria> newMSs = new List<StorageObjectCriteria>();

            if (!isInStorage)
            {
                Logger.LogInfo("Mapping Object New to Storage");
            }
            else if (msf.eventStatus != StorageObjectEventStatus.RECEIVED)
            {
                msf.eventStatus = StorageObjectEventStatus.RECEIVED;
                this.ADOSto.Update(msf, this.BuVO);
                Logger.LogInfo("Mapping Object Storage to Storage");
            }

            int freeCount = ADOSto.GetFreeCount(scanCode, warehouseID, areaID, isInStorage, batch, lot, this.BuVO);
            if (freeCount < amount && (isInStorage || (!isInStorage && this.StaticValue.IsFeature(FeatureCode.IB0100))))
            {
                if (!isInStorage && ADO.DataADO.GetInstant().SelectByCodeActive<ams_PackMaster>(scanCode, this.BuVO) != null)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1002, "ไม่สามารถเพิ่มรายการสินค้าได้ เนื่องจากจำนวนที่รับเข้าเกินจากเอกสาร Received");
                else if(!isInStorage)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1002, "รหัสสินค้า/พาเลท ไม่ถูกต้อง");
                else
                    throw new AMWException(this.Logger, AMWExceptionCode.V1002, "รหัสสินค้า/พาเลทหรือจำนวนที่อยู่ในคลัง ไม่ถูกต้อง");
            }

            for (int i = 0; i < amount; i++)
            {
                StorageObjectCriteria newMS = ADOSto.GetFree(scanCode,warehouseID, areaID, isInStorage, true, this.BuVO);

                if (newMS == null)
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.V1002, "ไม่พบรายการที่ว่างอยู่");
                }
                else if (!this.StaticValue.IsFeature(FeatureCode.IB0104)
                    && newMS.parentType == StorageObjectType.PACK
                    && msf.mapstos.Count() > 0
                    && !msf.mapstos.TrueForAll(x => x.type == newMS.type && x.code == newMS.code))
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.V1002, "ไม่รองรับ Multi SKU");
                }
                else if (amount > 1 && newMS.type != StorageObjectType.PACK)
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.V1002, "ไม่สามารถเพิ่มจำนวนหลายชิ้นในครั้งเดียวได้");
                }
                else if (msf.type == StorageObjectType.LOCATION && newMS.type == StorageObjectType.LOCATION)
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.B0001, "ไม่สามารถเพิ่ม พื้นที่เข้าไปในพื้นที่ได้");
                }
                else if (msf.type == StorageObjectType.PACK && newMS.type == StorageObjectType.PACK)
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.B0001, "ไม่สามารถเพิ่ม สินค้าเข้าไปในสินค้าได้");
                }
                else
                {
                    newMS.isFocus = false;
                    newMS.parentID = msf.id;
                    newMS.parentType = msf.type;
                    newMS.options = options;
                    if (newMS.id.HasValue)
                    {
                        if(newMS.areaID != msf.areaID)
                        {
                            UpdateAreaAllChilds(newMS, msf.areaID);
                            void UpdateAreaAllChilds(StorageObjectCriteria ms,long aid)
                            {
                                ADOSto.Update(ms, aid, this.BuVO);
                                ms.mapstos.ForEach(x => UpdateAreaAllChilds(x, aid));
                            }
                        }
                        else
                        {
                            ADOSto.Update(newMS, msf.areaID, this.BuVO);
                        }
                    }
                    else
                    {
                        newMS.eventStatus = StorageObjectEventStatus.IDEL;
                        ADOSto.Create(newMS, msf.areaID, batch, lot, this.BuVO);
                    }
                    //ADOSto.Put(newMS,batch,lot, this.BuVO);
                    if (!isInStorage && newMS.type != StorageObjectType.PACK)
                        newMS.isFocus = true;
                    newMSs.Add(newMS);
                }
            }


            msf.mapstos.AddRange(newMSs);
        }
        private void ActionRemove(
            VirtualMapSTOModeType mode,
            string scanCode,
            decimal amount,
            StorageObjectCriteria mapsto)
        {
            var msf = GetMapStoLastFocus(mapsto);

            if (mode == VirtualMapSTOModeType.REGISTER && msf.mapstos.Count(x => x.code == scanCode && x.eventStatus == StorageObjectEventStatus.IDEL) < amount)
                throw new AMWUtil.Exception.AMWException(this.Logger, AMWExceptionCode.V1002, "ไม่พบรายการที่ต้องการนำออก / รายการที่จะนำออกต้องเป็นรายการที่ยังไม่ได้รับเข้าเท่านั้น");
            else if (msf.mapstos.Count(x => x.code == scanCode) < amount)
                throw new AMWUtil.Exception.AMWException(this.Logger, AMWExceptionCode.V1002, "ไม่พบรายการที่ต้องการนำออก");

            var mapstos = msf.mapstos.OrderBy(x => x.eventStatus).ThenByDescending(x => x.id);
            for (int i = 0; i < amount; i++)
            {
                var rmItem = mapstos.FirstOrDefault(x => x.code == scanCode);
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
            foreach(var ms in mapsto.mapstos)
            {
                var m = GetBaseByCode(scanCode, ms);
                if (m != null)
                    return m;
            }
            return null;
        }
    }
}
