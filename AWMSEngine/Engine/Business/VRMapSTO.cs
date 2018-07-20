using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.ADO;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business
{
    public class VRMapSTO : BaseEngine<VRMapSTO.TReqModle, StorageObjectCriteria>
    {
        private StorageObjectADO ADOSto = ADO.StorageObjectADO.GetInstant();

        public class TReqModle
        {
            public string scanCode;
            public int amount;
            public VirtualMapSTOModeType mode;
            public VirtualMapSTOActionType action;
            public List<KeyValuePair<string, string>> options;
        }
        protected override StorageObjectCriteria ExecuteEngine(TReqModle reqVO)
        {
            StorageObjectCriteria mapsto = null;
            if(this.RequestParam.mapsto == null)
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

        private StorageObjectCriteria ExecFirstScan(TReqModle reqVO)
        {
            StorageObjectCriteria mapsto = null;
            Logger.LogDebug("//สแกนครั้งแรก");
            if (reqVO.mode == VirtualMapSTOModeType.REGISTER)
            {
                Logger.LogDebug("Register Mode.");
                Logger.LogDebug("//หา sto ในคลัง ทั้งแบบ Free และ No Free");
                mapsto = ADOSto.Get(reqVO.scanCode, false, false, this.BuVO);
                if (mapsto == null || mapsto.type == StorageObjectType.PACK)
                {
                    Logger.LogDebug("//ไม่พบในคลัง ให้หา sto นอกคลังแบบ Free");
                    mapsto = ADOSto.GetFree(reqVO.scanCode, false, true, this.BuVO);
                    if (mapsto != null)
                    {
                        Logger.LogDebug("//พบ sto ว่างประเภท " + mapsto.type);
                        ADOSto.Put(mapsto, this.BuVO);
                        Logger.LogDebug("//รับเข้าคลัง สถานะ WAIT");
                    }
                    else
                        throw new AMWException(this.Logger, AMWExceptionCode.V2001, "ไม่พบรายการในคลัง");
                }
                else if (mapsto != null)
                {
                    Logger.LogDebug("//พบในคลัง ดึงข้อมูลคลังมาแสดง");
                    mapsto = ADOSto.Get(reqVO.scanCode, true, true, this.BuVO);
                }
                /*else if (mapsto.type == StorageObjectType.PACK)
                {
                    Logger.LogDebug("//แสกนครั้งแรกไม่สามารถแสกนสินค้าโดยตรงได้ " + mapsto.type);
                    throw new AMWException(this.Logger, AMWExceptionCode.V2001, reqVO.scanCode);
                }*/
            }
            else if(reqVO.mode == VirtualMapSTOModeType.TRANSFER)
            {
                Logger.LogDebug("Transfer Mode.");
                mapsto = ADOSto.Get(reqVO.scanCode, true, true, this.BuVO);
                if (mapsto == null)
                    throw new AMWException(this.Logger, AMWExceptionCode.V2001, reqVO.scanCode);
            }

            mapsto.isFocus = true;
            return mapsto;
        }

        private StorageObjectCriteria ExecNextScan(TReqModle reqVO)
        {
            
            Logger.LogInfo("Get STO From Request.(Action)");
            StorageObjectCriteria mapsto = AMWUtil.Common.ObjectUtil.DynamicToModel<StorageObjectCriteria>(this.RequestParam.mapsto);
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
                    reqVO.amount,
                    reqVO.mode == VirtualMapSTOModeType.TRANSFER,
                    reqVO.options,
                    mapsto);
            }
            else if (reqVO.action == VirtualMapSTOActionType.REMOVE)
            {
                this.ActionRemove(reqVO.scanCode, reqVO.amount, mapsto);
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
            mapsto.isFocus = mapsto.code.Equals(scanCode);
            mapsto.mapstos.ForEach(x =>
            {
                mapsto.isFocus = mapsto.type != StorageObjectType.PACK & (ActionSelect(scanCode, x) | mapsto.isFocus);
            });
            return mapsto.isFocus;
        }

        private void ActionAdd(string scanCode,
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
                Logger.LogInfo("Mapping Object New to Storage");
            else
                Logger.LogInfo("Mapping Object Storage to Storage");

            int freeCount = ADOSto.GetFreeCount(scanCode, isInStorage, this.BuVO);
            if (freeCount < amount)
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "จำนวนที่มีไม่เพียงพอ");

            for (int i = 0; i < amount; i++)
            {
                StorageObjectCriteria newMS = ADOSto.GetFree(scanCode, isInStorage, true, this.BuVO);
                newMS.isFocus = false;
                if (amount > 1 && newMS.type != StorageObjectType.PACK)
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
                    newMS.parentID = msf.id;
                    newMS.parentType = msf.type;
                    ADOSto.Put(newMS, this.BuVO);
                    newMSs.Add(newMS);
                }
            }


            msf.mapstos.AddRange(newMSs);
        }
        private void ActionRemove(
            string scanCode,
            decimal amount,
            StorageObjectCriteria mapsto)
        {
            var msf = GetMapStoLastFocus(mapsto);

            if (msf.mapstos.Count(x => x.code == scanCode) < amount)
                throw new AMWUtil.Exception.AMWException(this.Logger, AMWExceptionCode.V1002, "จำนวนไม่เพียงพอ");
            var mapstos = msf.mapstos.OrderBy(x => x.eventStatus).ThenByDescending(x => x.id);
            for (int i = 0; i < amount; i++)
            {
                var rmItem = mapstos.FirstOrDefault(x => x.code == scanCode);
                rmItem.parentID = null;
                rmItem.parentType = null;
                ADOSto.Put(rmItem, this.BuVO);
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
