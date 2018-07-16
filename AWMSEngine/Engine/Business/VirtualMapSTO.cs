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
    public class VirtualMapSTO : BaseEngine<VirtualMapSTO.TReqModle, StorageObjectCriteria>
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
                Logger.LogInfo("Get STO From Request.(Action)");
                mapsto = AMWUtil.Common.ObjectUtil.DynamicToModel<StorageObjectCriteria>(this.RequestParam.mapsto);
                if (reqVO.action == VirtualMapSTOActionType.Select)
                {
                    this.ClaerMapStoFocus(mapsto);
                    mapsto.isFocus = this.ActionSelect(reqVO.scanCode, mapsto.mapstos);
                    if (mapsto.code.Equals(reqVO.scanCode))
                        mapsto.isFocus = true;
                    if (mapsto.isFocus == false)
                        throw new AMWException(this.Logger, AMWExceptionCode.V1002, mapsto.code);
                }
                else if (reqVO.action == VirtualMapSTOActionType.Add)
                {
                    this.ActionAdd(
                        reqVO.scanCode,
                        reqVO.amount,
                        reqVO.mode == VirtualMapSTOModeType.TRANSFER,
                        reqVO.options,
                        mapsto);
                }
                else if (reqVO.action == VirtualMapSTOActionType.Remove)
                {
                    this.ActionRemove(reqVO.scanCode, reqVO.amount, mapsto);
                }
            }


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
                mapsto = ADOSto.Get(reqVO.scanCode, true, this.BuVO);
                if (mapsto == null || !mapsto.mstID.HasValue)
                {
                    Logger.LogDebug("//ไม่พบในคลัง ให้หา sto นอกคลังแบบ Free");
                    mapsto = ADOSto.GetFree(reqVO.scanCode, false, this.BuVO);
                    if (mapsto != null)
                    {
                        Logger.LogDebug("//พบ sto ว่างประเภท " + mapsto.type);
                        if (mapsto.type == StorageObjectType.PACK)
                        {
                            var baseObj = new StorageObjectCriteria()
                            {
                                id = null,
                                type = StorageObjectType.BASE,
                                mstID = null,
                                parentID = null,
                                parentType = null,
                                code = mapsto.code,
                                name = mapsto.name,
                                isFocus = true,
                                mapstos = new List<StorageObjectCriteria>()
                            };
                            ADOSto.Put(baseObj, this.BuVO);
                            mapsto.parentID = baseObj.id;
                            mapsto.parentType = baseObj.type;
                            baseObj.mapstos.Add(mapsto);
                            ADOSto.Put(mapsto, this.BuVO);
                            Logger.LogDebug("//รับเข้าคลัง โดยมี Base รองรับ (มี base ว่างเป็น parent)");
                            mapsto = baseObj;
                        }
                        else
                        {
                            ADOSto.Put(mapsto, this.BuVO);
                            Logger.LogDebug("//รับเข้าคลัง โดยตรง (ไม่มี parent)");
                        }
                    }
                    else
                        throw new AMWException(this.Logger, AMWExceptionCode.V2001, reqVO.scanCode);
                }
                else if (mapsto.type != StorageObjectType.BASE)
                {
                    Logger.LogDebug("//หา sto ในคลังเจอ แต่ไม่ใช่ประเภท BASE //ที่พบคือ " + mapsto.type);
                    throw new AMWException(this.Logger, AMWExceptionCode.V2001, reqVO.scanCode);
                }
            }
            else if(reqVO.mode == VirtualMapSTOModeType.TRANSFER)
            {
                Logger.LogDebug("Transfer Mode.");
                mapsto = ADOSto.Get(reqVO.scanCode, true, this.BuVO);
                if (mapsto == null)
                    throw new AMWException(this.Logger, AMWExceptionCode.V2001, reqVO.scanCode);
            }

            mapsto.isFocus = true;
            return mapsto;
        }


        
        /***********************************/
        /***********************************/
        /***********************************/
        private bool ActionSelect(string scanCode, List<StorageObjectCriteria> mapstos)
        {
            foreach (var m in mapstos)
            {
                if (m.type == StorageObjectType.PACK) continue;
                if (m.name == null) continue;
                if (m.code.Equals(scanCode) || ActionSelect(scanCode, m.mapstos))
                {
                    m.isFocus = true;
                    return true;
                }
            }
            return false;
        }

        private void ActionAdd(string scanCode,
            int amount,
            bool isInStorage,
            List<KeyValuePair<string, string>> options,
            StorageObjectCriteria mapsto)
        {
            var msf = GetMapStoLastFocus(mapsto);
            List<StorageObjectCriteria> newMSs = new List<StorageObjectCriteria>();

            if (!isInStorage)
                Logger.LogInfo("Mapping Object New to Storage");
            else
                Logger.LogInfo("Mapping Object Storage to Storage");

            int freeCount = ADOSto.GetFreeCount(scanCode, isInStorage, this.BuVO);
            if (freeCount < amount)
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "Amount");

            for (int i = 0; i < amount; i++)
            {
                StorageObjectCriteria newMS = ADOSto.GetFree(scanCode, isInStorage, this.BuVO);
                if (msf.type == StorageObjectType.LOCATION && newMS.type == StorageObjectType.PACK)
                {
                    var baseObj = new StorageObjectCriteria()
                    {
                        id = null,
                        type = StorageObjectType.BASE,
                        mstID = null,
                        parentID = msf.id,
                        parentType = msf.type,
                        code = newMS.code,
                        name = null,
                        isFocus = false,
                        mapstos = new List<StorageObjectCriteria>()
                    };
                    ADOSto.Put(baseObj, this.BuVO);
                    baseObj.mapstos.Add(newMS);

                    newMS.parentID = baseObj.id;
                    newMS.parentType = baseObj.type;
                    ADOSto.Put(newMS, this.BuVO);
                    newMSs.Add(baseObj);
                }
                if (msf.type == StorageObjectType.LOCATION && newMS.type == StorageObjectType.LOCATION)
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.B0001, "ไม่สามารถเพิ่ม พื้นที่เข้าไปในพื้นที่ได้");
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
            for(int i = 0;i< amount; i++)
            {
                var rmItem = msf.mapstos.FirstOrDefault(x => x.code == scanCode);
                if (rmItem == null)
                    throw new AMWUtil.Exception.AMWException(this.Logger, AMWExceptionCode.V1002, scanCode);
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
