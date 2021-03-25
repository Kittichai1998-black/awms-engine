using ADO.WCSStaticValue;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AMWUtil.Model;
using AWCSEngine.Util;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWCSEngine.Engine.CommonEngine
{
    public class RegisterMcWork_OutboundComm : BaseCommonEngine<TReq_RegisterMcWork_OutboundAPI.TWork, act_McWork>
    {
        public RegisterMcWork_OutboundComm(string logref, VOCriteria buVO) : base(logref,buVO)
        {
        }

        protected override act_McWork ExecuteChild(TReq_RegisterMcWork_OutboundAPI.TWork req)
        {
            var baseObj = ADO.WCSDB.BaseObjectADO.GetInstant().GetByCode(req.baseCode, this.BuVO);
            if (baseObj == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V0_STO_NOT_FOUND, req.baseCode);
            if (baseObj.EventStatus == BaseObjectEventStatus.IDLE)
                throw new AMWException(this.Logger, AMWExceptionCode.V0_PALLET_STATUS_CANT_ISSUE, new string[] { req.baseCode, baseObj.EventStatus.ToString() });

            var souLoc = StaticValueManager.GetInstant().GetLocation(baseObj.Location_ID);
            var desWh = StaticValueManager.GetInstant().GetWarehouse(req.desWarehouseCode);
            var desArea = StaticValueManager.GetInstant().GetArea(req.desAreaCode);
            var desLoc = StaticValueManager.GetInstant().GetLocation(req.desWarehouseCode, req.desAreaCode);
            TreeNode<long> treeRoute = null;// LocationUtil.GetLocationRouteTree(baseObj.Location_ID, desLoc.ID.Value);
            if (treeRoute == null)
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V0_ROUTE_NOT_FOUND, new string[] { souLoc.Code, desLoc.Code });
            }

            act_McWork mcQ = new act_McWork()
            {
                ID = null,
                WMS_WorkQueue_ID = req.wqID,
                SeqGroup = req.seqGroup,
                SeqItem = req.seqItem,
                Priority = req.priority,
                QueueType = 2,
                BaseObject_ID = baseObj.ID.Value,
                Sou_Area_ID = souLoc.Area_ID,
                Sou_Location_ID = souLoc.ID.Value,
                Des_Area_ID = desArea.ID.Value,
                Des_Location_ID = desLoc == null ? null : desLoc.ID,
                Cur_Area_ID = baseObj.Area_ID,
                Cur_Location_ID = baseObj.Location_ID,
                TreeRoute = "{}",
            };

            mcQ.ID = ADO.WCSDB.DataADO.GetInstant().Insert<act_McWork>(mcQ, this.BuVO);

            return mcQ;
        }
    }
}
