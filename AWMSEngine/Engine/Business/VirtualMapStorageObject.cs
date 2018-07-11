using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business
{
    public class VirtualMapStorageObject : BaseEngine<VirtualMapStorageObject.TReqModle, StorageObjectCriteria>
    {
        public class TReqModle
        {
            public string scanCode;
            public int amount;
            public VirtualMapSTOActionType action;
            public List<KeyValuePair<string, string>> options;
        }
        protected override StorageObjectCriteria ExecuteEngine(TReqModle reqVO)
        {
            StorageObjectCriteria mapsto = null;
            if(this.RequestParam.mapsto == null)
            {
                Logger.LogInfo("Get STO From DB.(First Scan)");
                mapsto = ADO.StorageObjectADO.GetInstant().Get(reqVO.scanCode, true, this.Logger);

                if (mapsto == null)
                {
                    Logger.LogInfo("New STO From Request.(First Scan)");
                    mapsto = new Engine.Business.NewVirtualMapStorageObject().Execute(this.Logger, this.BuVO,
                        new NewVirtualMapStorageObject.TReqModel()
                        {
                            code = reqVO.scanCode,
                            //amount = reqVO.amount,
                            options = reqVO.options
                        });
                }
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
                        throw new AMWException(this.Logger, AMWExceptionCode.V0005, "Code");
                }
                else if (reqVO.action == VirtualMapSTOActionType.Add)
                {
                    this.ActionAdd(reqVO.scanCode, reqVO.amount, reqVO.options, mapsto);
                }
                else if (reqVO.action == VirtualMapSTOActionType.Remove)
                {
                    this.ActionRemove(reqVO.scanCode, reqVO.amount, mapsto);
                }
            }


            return mapsto;
        }

        private bool ActionSelect(string scanCode, List<StorageObjectCriteria> mapstos)
        {
            foreach (var m in mapstos)
            {
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
            List<KeyValuePair<string, string>> options,
            StorageObjectCriteria mapsto)
        {
            var msf = GetMapStoLastFocus(mapsto);
            bool isRegis = !mapsto.id.HasValue;
            List<StorageObjectCriteria> newMSs = new List<StorageObjectCriteria>();
            StorageObjectCriteria newMS = null;
            if (isRegis)
            {
                newMS = new Engine.Business.NewVirtualMapStorageObject()
                    .Execute(this.Logger, this.BuVO, new NewVirtualMapStorageObject.TReqModel()
                    {
                        code = scanCode,
                        //amount = amount,
                        options = options
                    });

                for (int i = 0; i < amount; i++)
                {
                    var v = ObjectUtil.CloneModel<StorageObjectCriteria>(newMS);
                    v.parentID = msf.id;
                    v.parentType = msf.type;
                    newMSs.Add(v);
                }
            }
            else
            {
                int freeCount = ADO.StorageObjectADO.GetInstant().GetFreeCount(scanCode, true, this.Logger);
                if (freeCount < amount)
                    throw new AMWException(this.Logger, AMWExceptionCode.V0006, scanCode);
                newMS = new Engine.Business.NewVirtualMapStorageObject()
                    .Execute(this.Logger, this.BuVO, new NewVirtualMapStorageObject.TReqModel()
                    {
                        code = scanCode,
                        options = options
                    });
                if(newMS.type == StorageObjectType.PACK)
                {
                    for (int i = 0; i < amount; i++)
                    {
                        var v = ObjectUtil.CloneModel<StorageObjectCriteria>(newMS);
                        v.parentID = msf.id;
                        v.parentType = msf.type;
                        newMSs.Add(v);
                    }
                }
                else
                {
                    newMS = ADO.StorageObjectADO.GetInstant().Get(scanCode, false, this.Logger);
                    newMS.parentID = msf.id;
                    newMS.parentType = msf.type;
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
            var rmItem = msf.mapstos.FirstOrDefault(x => x.code == scanCode);
            if (rmItem == null)
                throw new AMWUtil.Exception.AMWException(this.Logger, AMWExceptionCode.V0002, scanCode);
            for(int i = 0;i< amount; i++)
            {
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
