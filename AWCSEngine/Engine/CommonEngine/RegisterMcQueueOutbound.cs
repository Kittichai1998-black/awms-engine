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
    public class RegisterMcQueueOutbound : BaseCommonEngine<RegisterMcQueueOutbound.TReq, act_McWork>
    {
        public class TReq
        {
            public long wqID;
            public string baseCode;
            public string desLocCode;
        }

        public RegisterMcQueueOutbound(string logref, VOCriteria buVO) : base(logref,buVO)
        {
        }

        protected override act_McWork ExecuteChild(RegisterMcQueueOutbound.TReq req)
        {
            var baseObj = ADO.WCSDB.BaseObjectADO.GetInstant().GetByCode(req.baseCode, this.BuVO);
            if (baseObj == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V0_STO_NOT_FOUND, req.baseCode);
            if (baseObj.EventStatus == BaseObjectEventStatus.IDEL)
                throw new AMWException(this.Logger, AMWExceptionCode.V0_PALLET_STATUS_CANT_ISSUE, new string[] { req.baseCode, baseObj.EventStatus.ToString() });

            var souLoc = StaticValueManager.GetInstant().GetLocation(baseObj.Location_ID);
            var desLoc = StaticValueManager.GetInstant().GetLocation(req.desLocCode);
            var treeRoute = LocationUtil.GetLocationRouteTree(baseObj.Location_ID, desLoc.ID.Value);
            if (treeRoute == null)
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V0_ROUTE_NOT_FOUND, new string[] { souLoc.Code, desLoc.Code });
            }

            act_McWork mcQ = new act_McWork()
            {
                ID = null,
                BaseObject_ID = baseObj.ID.Value,
                Sou_Area_ID = souLoc.Area_ID,
                Sou_Location_ID = souLoc.ID.Value,
                Des_Area_ID = desLoc.Area_ID,
                Des_Location_ID = desLoc.ID.Value,
                Area_ID = baseObj.Area_ID,
                Location_ID = baseObj.Location_ID,
                TreeRoute = treeRoute.Json(),
                WMS_WorkQueue_ID = req.wqID,
            };

            mcQ.ID = ADO.WCSDB.DataADO.GetInstant().Insert<act_McWork>(mcQ, this.BuVO);

            return mcQ;
        }
    }
}
