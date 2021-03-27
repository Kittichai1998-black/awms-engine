using ADO.WCSDB;
using ADO.WCSStaticValue;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Criteria.API;
using AMSModel.Entity;
using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWCSEngine.Util;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace AWCSEngine.Engine.CommonEngine
{
    public class Comm_CreateMcWorkIN_byBaseObjTemp : BaseCommonEngine<Comm_CreateMcWorkIN_byBaseObjTemp.TReq, act_McWork>
    {
        public class TReq
        {
            public long baseObjID;
        }

        public Comm_CreateMcWorkIN_byBaseObjTemp(string logref, VOCriteria buVO) : base(logref, buVO)
        {
        }

        protected override act_McWork ExecuteChild(TReq req)
        {

            act_BaseObject baseObj = ADO.WCSDB.BaseObjectADO.GetInstant().GetByID(req.baseObjID, this.BuVO);
            if (baseObj.EventStatus != BaseObjectEventStatus.TEMP)
                throw new AMWException(this.Logger, AMWExceptionCode.V0_BASE_NOT_TEMP_ESTATUS, baseObj.Code);

            var mc = Controller.McRuntimeController.GetInstant().GetMcRuntime(baseObj.McObject_ID.Value);

            var bArea = this.StaticValue.GetArea(baseObj.Area_ID);
            var bWh = this.StaticValue.GetWarehouse(bArea.Warehouse_ID);
            var bLocation = this.StaticValue.GetLocation(baseObj.Location_ID);

            var wq =
                ADO.WCSAPI.CallWmsAPI.GetInstant().Send_RegisterWQ(new WMReq_RegisterWQ()
                {
                    ioType = IOType.INBOUND,
                    actualTime = DateTime.Now,
                    baseCode = baseObj.Code,
                    warehouseCode = bWh.Code,
                    areaCode = bArea.Code,
                    locationCode = bLocation.Code,
                    desAreaCode = null,
                    desLocationCode = null,
                    desWarehouseCode = null,
                    weight = 1500,
                    autoDoc = false,
                    forCustomerCode = null,
                    height = null,
                    length = null,
                    width = null,
                    options = string.Empty,
                    barcode_pstos = new List<string>() { baseObj.Code }
                });

            var desWh = this.StaticValue.GetWarehouse(wq.desWarehouseCode);
            var desArea = this.StaticValue.GetArea(wq.desAreaCode);
            var desLoc = this.StaticValue.GetLocation(wq.desWarehouseCode, wq.desLocationCode);
            act_McWork mcQ = new act_McWork()
            {
                ID = null,
                QueueType = 1,//INBOUND
                WMS_WorkQueue_ID = wq.queueID,

                Priority = wq.priority,
                SeqGroup = wq.seqGroup,
                SeqItem = wq.seqItem,

                BaseObject_ID = baseObj.ID.Value,
                Rec_McObject_ID = mc.ID,
                Cur_McObject_ID = null,

                Cur_Warehouse_ID = bWh.ID.Value,
                Cur_Area_ID = baseObj.Area_ID,
                Cur_Location_ID = baseObj.Location_ID,

                Sou_Area_ID = bArea.ID.Value,
                Sou_Location_ID = bLocation.ID.Value,

                Des_Area_ID = desArea.ID.Value,
                Des_Location_ID = desLoc.ID,

                ActualTime = DateTime.Now,
                StartTime = DateTime.Now,
                EndTime = null,
                EventStatus = McWorkEventStatus.ACTIVE_RECEIVE,
                Status = EntityStatus.ACTIVE,


                TreeRoute = "{}"
            };
            mcQ.ID = ADO.WCSDB.DataADO.GetInstant().Insert<act_McWork>(mcQ, this.BuVO);

            baseObj.SkuCode = wq.baseInfo.packInfos.First().code;
            baseObj.SkuQty = wq.baseInfo.packInfos.First().baseQty;
            baseObj.SkuUnit = wq.baseInfo.packInfos.First().baseUnit;
            baseObj.Info1 = wq.baseInfo.packInfos.First().Info1;
            baseObj.Info2 = wq.baseInfo.packInfos.First().Info2;
            baseObj.Info3 = wq.baseInfo.packInfos.First().Info3;
            baseObj.EventStatus = BaseObjectEventStatus.MOVE;
            baseObj.Status = EntityStatus.ACTIVE;
            ADO.WCSDB.DataADO.GetInstant().UpdateBy<act_BaseObject>(baseObj, this.BuVO);

            mc.McWork_0_Reload();
            return mcQ;


        }
    }
}
