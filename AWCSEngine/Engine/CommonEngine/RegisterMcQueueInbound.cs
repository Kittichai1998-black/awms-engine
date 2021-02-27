using ADO.WCSDB;
using ADO.WCSStaticValue;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWCSEngine.Util;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWCSEngine.Engine.CommonEngine
{
    public class RegisterMcQueueInbound : BaseCommonEngine<RegisterMcQueueInbound.TReq, act_McWork>
    {
        public class TReq
        {
            public long wqID;
            public string souAreaCode;
            public string souLocCode;
            public string desAreaCode;
            public string desLocCode;
            public RegisterBaseObjectCriteria baseObjCri;
        }

        public RegisterMcQueueInbound(string logref, VOCriteria buVO) : base(logref,buVO)
        {
        }

        protected override act_McWork ExecuteChild(TReq req)
        {
            var baseObjC = req.baseObjCri;
            act_BaseObject baseObj = ADO.WCSDB.BaseObjectADO.GetInstant().GetByCode(baseObjC.Code, this.BuVO);
            if (baseObj != null)
                throw new AMWException(this.Logger, AMWExceptionCode.V0_BASE_DUPLICATE, baseObjC.Code);

            var souLoc = StaticValueManager.GetInstant().GetLocation(req.souLocCode);
            var desLoc = StaticValueManager.GetInstant().GetLocation(req.desLocCode);
            new CreateBaseObjectTemp_byQR(this.LogRefID,this.BuVO).Execute(null);

            var treeRoute = LocationUtil.GetLocationRouteTree(req.souLocCode, req.desLocCode);
            act_McWork mcQ = new act_McWork()
            {
                ID = null,
                WMS_WorkQueue_ID = req.wqID,
                Sou_Area_ID = souLoc.Area_ID,
                Sou_Location_ID = souLoc.ID.Value,
                Des_Area_ID = desLoc.Area_ID,
                Des_Location_ID = desLoc.ID.Value,
                Area_ID = souLoc.Area_ID,
                Location_ID = souLoc.ID.Value,
                BaseObject_ID = baseObj.ID.Value,
                Status = EntityStatus.INACTIVE,
                TreeRoute = treeRoute.Json()
            };
            mcQ.ID = DataADO.GetInstant().Insert<act_McWork>(mcQ, this.BuVO);
            return mcQ;
        }
    }
}
