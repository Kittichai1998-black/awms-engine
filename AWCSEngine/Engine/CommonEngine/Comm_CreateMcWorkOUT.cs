using ADO.WCSStaticValue;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Criteria.API;
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
    public class Comm_CreateMcWorkOUT : BaseCommonEngine<WCReq_RegisterMcWork_OutboundAPI.TWork, act_McWork>
    {
        public Comm_CreateMcWorkOUT(string logref, VOCriteria buVO) : base(logref,buVO)
        {
        }

        protected override act_McWork ExecuteChild(WCReq_RegisterMcWork_OutboundAPI.TWork req)
        {
            var baseObj = ADO.WCSDB.BaseObjectADO.GetInstant().GetByCode(req.baseCode, this.BuVO);
            if (baseObj == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V0_STO_NOT_FOUND, req.baseCode);
            if (baseObj.EventStatus == BaseObjectEventStatus.IDLE)
                throw new AMWException(this.Logger, AMWExceptionCode.V0_PALLET_STATUS_CANT_ISSUE, new string[] { req.baseCode, baseObj.EventStatus.ToString() });

            var souLoc = StaticValueManager.GetInstant().GetLocation(baseObj.Location_ID);
            var souArea = StaticValueManager.GetInstant().GetArea(souLoc.Area_ID);

            var desLoc = StaticValueManager.GetInstant().GetLocation(req.desWarehouseCode, req.desLocationCode);
            var desArea = StaticValueManager.GetInstant().GetArea(desLoc.Area_ID);
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
                QueueType = 2,//OUTBOUND
                BaseObject_ID = baseObj.ID.Value,
                Cur_McObject_ID = null,
                Rec_McObject_ID = null,
                Sou_Area_ID = souLoc.Area_ID,
                Sou_Location_ID = souLoc.ID.Value,
                Des_Area_ID = desArea.ID.Value,
                Des_Location_ID = desLoc == null ? null : desLoc.ID,
                Cur_Warehouse_ID = souArea.Warehouse_ID,
                Cur_Area_ID = baseObj.Area_ID,
                Cur_Location_ID = baseObj.Location_ID,
                TreeRoute = "{}",
                ActualTime = DateTime.Now,
                StartTime = DateTime.Now,
                EndTime = null,
                EventStatus = McWorkEventStatus.IN_QUEUE,
                Status = EntityStatus.ACTIVE
            };

            mcQ.ID = ADO.WCSDB.DataADO.GetInstant().Insert<act_McWork>(mcQ, this.BuVO);

            return mcQ;
        }
    }
}
