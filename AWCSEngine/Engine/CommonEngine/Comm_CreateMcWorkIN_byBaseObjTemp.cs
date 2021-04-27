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
                ADO.WCSAPI.CallWmsAPI.GetInstant().Send_RegisterWQ(
                    new WMReq_RegisterWQ()
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
                    barcode_pstos = new List<string>() { baseObj.LabelData }
                },
                    this.BuVO);

            
            var desArea = this.StaticValue.GetArea(wq.desAreaCode);
            var desLoc = this.StaticValue.GetLocation(wq.desWarehouseCode, wq.desLocationCode);

            long? Change_Des_Location_ID = this.Get_Change_Des_Location(wq.queueRefID);

            act_McWork mcQ = new act_McWork()
            {
                ID = null,
                IOType = IOType.INBOUND,
                QueueType = (int)IOType.INBOUND,//INBOUND
                WMS_WorkQueue_ID = wq.queueID,
                BuWork_ID = wq.queueID,
                TrxRef = wq.queueRefID,

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
                Des_Location_ID = Change_Des_Location_ID ?? desLoc.ID,

                ActualTime = DateTime.Now,
                StartTime = DateTime.Now,
                EndTime = null,
                EventStatus = McWorkEventStatus.ACTIVE_RECEIVE,
                Status = EntityStatus.ACTIVE,

                TreeRoute = "{}"
            };
            mcQ.ID = ADO.WCSDB.DataADO.GetInstant().Insert<act_McWork>(mcQ, this.BuVO);

            baseObj.BuWork_ID = wq.queueID;
            baseObj.SkuCode = wq.baseInfo.packInfos.First().code;
            baseObj.SkuQty = wq.baseInfo.packInfos.First().baseQty;
            baseObj.SkuUnit = wq.baseInfo.packInfos.First().baseUnit;
            baseObj.SkuLot = wq.baseInfo.packInfos.First().lot;
            baseObj.SkuGrade = wq.baseInfo.packInfos.First().grade;
            baseObj.SkuItemNo = wq.baseInfo.packInfos.First().itemNo;
            baseObj.Info1 = wq.baseInfo.packInfos.First().Info1;
            baseObj.Info2 = wq.baseInfo.packInfos.First().Info2;
            baseObj.Info3 = wq.baseInfo.packInfos.First().Info3;
            baseObj.Customer = wq.baseInfo.packInfos.First().customer;
            baseObj.EventStatus = BaseObjectEventStatus.INBOUND;
            baseObj.Status = EntityStatus.ACTIVE;
            ADO.WCSDB.DataADO.GetInstant().UpdateBy<act_BaseObject>(baseObj, this.BuVO);

            mc.McWork_0_Reload();
            return mcQ;


        }
  
        private long? Get_Change_Des_Location(string queueRefID)
        {

            var locSlots = ADO.WCSDB.LocationADO.GetInstant().List_UseLocationBayLv_ByBuWork(queueRefID, this.BuVO)
                .Where(x=>x.Slot_Use<x.Slot_Max).OrderByDescending(x => x.Loc_BayLv).ToList();

            var shus = Controller.McRuntimeController.GetInstant().GetMcRuntimeByArea(locSlots.First().Area_ID)
                .Where(x=>x.IsOnline && x.Code.StartsWith("SHU"))
                .OrderBy(x=>x.McObj.CommandActionTime);


            foreach(var shu in shus)
            {
                if (locSlots.Any(l => shu.Cur_Location.Code.EndsWith(l.Loc_Bay + l.Loc_Lv)))
                    return shu.StempActionTime().Cur_Location.ID;
                if((DateTime.Now- shu.McObj.CommandActionTime).Minutes > 5)
                {
                    var loc = locSlots.FirstOrDefault(l=> !shus.Where(s=>s!=shu)
                                                            .Any(s=>s.Cur_Location.Code.EndsWith(l.Loc_Bay + l.Loc_Lv))) ;
                    if (loc != null)
                        return StaticValue.Locations.First(l => l.Area_ID==loc.Area_ID && l.Code.EndsWith(loc.Loc_BayLv)).ID;
                }
            }

            return null;
        }
    }
}
