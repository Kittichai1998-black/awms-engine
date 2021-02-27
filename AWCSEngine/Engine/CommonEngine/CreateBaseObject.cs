using ADO.WCSDB;
using ADO.WCSStaticValue;
using AMSModel.Constant.EnumConst;
using AMSModel.Entity;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWCSEngine.Engine.CommonEngine;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWCSEngine.Engine.CommonEngine
{
    public class CreateBaseObject : BaseCommonEngine<RegisterMcQueueInbound.TReq, act_BaseObject>
    {
        public CreateBaseObject(string logref) : base(logref)
        {
        }

        protected override act_BaseObject ExecuteChild(RegisterMcQueueInbound.TReq req)
        {
            act_BaseObject baseObj = ADO.WCSDB.BaseObjectADO.GetInstant().GetByCode(req.baseObjCri.Code, this.BuVO);
            if (baseObj != null)
                throw new AMWException(this.Logger, AMWExceptionCode.V0_BASE_DUPLICATE, req.baseObjCri.Code);

            var souLoc = StaticValueManager.GetInstant().GetLocation(req.souLocCode);
            baseObj = new act_BaseObject()
            {
                ID = null,
                Code = req.baseObjCri.Code,
                Area_ID = souLoc.Area_ID,
                Location_ID = souLoc.ID.Value,
                Model = req.baseObjCri.Model,
                SkuCode = req.baseObjCri.SkuCode,
                SkuName = req.baseObjCri.SkuName,
                SkuQty = req.baseObjCri.SkuQty,
                SkuUnit = req.baseObjCri.SkuUnit,
                WeiKG = req.baseObjCri.WeiKG,
                LabelData = req.baseObjCri.LabelData,
                EventStatus = BaseObjectEventStatus.IDEL,
            };

            baseObj.ID = DataADO.GetInstant().Insert<act_BaseObject>(baseObj, this.BuVO);
            return baseObj;

        }
    }
}
