using ADO.WCSDB;
using ADO.WCSStaticValue;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using AMWUtil.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AWCSEngine.Util
{
   public static class InboundUtil
    {
        /// <summary>
        /// Create BaseObject
        /// </summary>
        /// <param name="_McObj"></param>
        /// <param name="_buWork"></param>
        /// <param name="_CurArea"></param>
        /// <param name="_CurLocation"></param>
        /// <param name="BuVO"></param>
        /// <returns></returns>
        public static act_BaseObject createBaseObject(act_McObject _McObj, act_BuWork _buWork, acs_Area _CurArea, acs_Location _CurLocation, VOCriteria BuVO)
        {
            string baseCode;
            do
            {
                baseCode = (DataADO.GetInstant().NextNum("base_no", false, BuVO) % (Math.Pow(10, 10))).ToString("0000000000");
            } while (DataADO.GetInstant().SelectByCodeActive<act_BaseObject>(baseCode, BuVO) != null);

           var baseObj = new act_BaseObject()
            {
                ID = null,
                BuWork_ID = _buWork == null ? null : _buWork.ID,
                Code = baseCode,
                Model = "N/A",
                McObject_ID = _McObj.ID,
                Warehouse_ID = _CurArea == null ? 0 : _CurArea.Warehouse_ID,
                Area_ID = _CurLocation == null ? 0 : _CurLocation.Area_ID,
                Location_ID = _McObj != null && _McObj.Cur_Location_ID != null ? _McObj.Cur_Location_ID.GetValueOrDefault() : 0,
                LabelData = _McObj.DV_Pre_BarProd,                
                DisCharge = _buWork == null ? 0 : _buWork.DisCharge,
                Customer = _buWork == null ? null : _buWork.Customer,
                SkuCode = _buWork == null ? null : _buWork.SkuCode,
                SkuGrade = _buWork == null ? null : _buWork.SkuGrade,
                SkuLot = _buWork == null ? null : _buWork.SkuLot,
                SkuItemNo = _buWork == null ? null : _buWork.ItemNo,
                SkuQty = _buWork == null ? 0 : _buWork.SkuQty,
                SkuUnit = _buWork == null ? null : _buWork.SkuUnit,
                SkuStatus = _buWork == null ? null : _buWork.SkuStatus,
                EventStatus = BaseObjectEventStatus.TEMP,
                Status = EntityStatus.ACTIVE
            };
            baseObj.ID = DataADO.GetInstant().Insert<act_BaseObject>(baseObj, BuVO);
            return baseObj;
        }

        public static act_BuWork GetBuWorkByLabel(act_McObject _McObj, acs_Area _CurArea, VOCriteria BuVO)
        {
            var buWork = DataADO.GetInstant().SelectBy<act_BuWork>(
                            ListKeyValue<string, object>
                            .New("status", EntityStatus.ACTIVE)
                            .Add("Des_Warehouse_ID", _CurArea.Warehouse_ID)
                            .Add("LabelData", _McObj.DV_Pre_BarProd), BuVO)
                .FirstOrDefault();
            return buWork;
        }

        public static act_BaseObject GetBaseObjectByLabel(act_McObject _McObj, acs_Area _CurArea, VOCriteria BuVO)
        {
            var baseObj = DataADO.GetInstant().SelectBy<act_BaseObject>(
                            ListKeyValue<string, object>
                            .New("status", EntityStatus.ACTIVE)
                            .Add("Warehouse_ID", _CurArea.Warehouse_ID)
                            .Add("LabelData", _McObj.DV_Pre_BarProd), BuVO)                
                .FirstOrDefault();
            return baseObj;
        }

        public static act_BuWork GetBuWorkByObject(act_BaseObject _BaseObject, VOCriteria BuVO)
        {
            var buWork = DataADO.GetInstant().SelectByIDActive<act_BuWork>(_BaseObject.BuWork_ID, BuVO);
            return buWork;
        }

        public static act_McWork createWorkQueue(act_McObject _McObj, act_BaseObject _bo, act_BuWork _bu, VOCriteria BuVO)
        {
            if (_bo == null) { return null; }
            
                _bo.EventStatus = BaseObjectEventStatus.INBOUND;
                _bo.McObject_ID = _McObj.ID;
                DataADO.GetInstant().UpdateBy<act_BaseObject>(_bo, BuVO);

                var bArea = StaticValueManager.GetInstant().GetArea(_bo.Area_ID);
                var bWh = StaticValueManager.GetInstant().GetWarehouse(bArea.Warehouse_ID);

                //หา Location ของ Mc
                var bLocation = StaticValueManager.GetInstant().GetLocation(_McObj.Cur_Location_ID.GetValueOrDefault());

                var desLoc = StaticValueManager.GetInstant().GetLocation(_bu.Des_Location_ID.Value);
                var desArea = StaticValueManager.GetInstant().GetArea(_bu.Des_Area_ID.Value);
                var desWh = StaticValueManager.GetInstant().GetWarehouse(_bu.Des_Warehouse_ID.Value);

                act_McWork mq = new act_McWork()
                {
                    ID = null,
                    IOType = IOType.INBOUND,
                    QueueType = (int)QueueType.QT_1,
                    WMS_WorkQueue_ID = _bu.ID.Value,
                    BuWork_ID = _bu.ID.Value,
                    TrxRef = _bu.TrxRef,

                    Priority = _bu.Priority,
                    SeqGroup = _bu.SeqGroup,
                    SeqItem = _bu.SeqIndex,

                    BaseObject_ID = _bo.ID.Value,
                    //Rec_McObject_ID = this.ID,
                    Rec_McObject_ID = null,
                    Cur_McObject_ID = null,

                    Cur_Warehouse_ID = bWh.ID.Value,
                    Cur_Area_ID = _bo.Area_ID,
                    Cur_Location_ID = _bo.Location_ID,

                    Sou_Area_ID = bArea.ID.Value,
                    Sou_Location_ID = bLocation.ID.Value,

                    Des_Area_ID = desArea.ID.Value,

                    ActualTime = DateTime.Now,
                    StartTime = DateTime.Now,
                    EndTime = null,
                    EventStatus = McWorkEventStatus.ACTIVE_RECEIVE,
                    Status = EntityStatus.ACTIVE,

                    TreeRoute = "{}"
                };
                mq.ID = ADO.WCSDB.DataADO.GetInstant().Insert<act_McWork>(mq, BuVO);

                _bu.Status = EntityStatus.ACTIVE;
                _bu.WMS_WorkQueue_ID = mq.ID;
                DataADO.GetInstant().UpdateBy<act_BuWork>(_bu, BuVO);

            return mq;
            
        }

        public static acs_McMaster findSRM(act_BaseObject _bo, VOCriteria BuVO)
        {
            var mcSRM = DataADO.GetInstant().SelectBy<acs_McMaster>(
                       ListKeyValue<string, object>
                       .New("Warehouse_ID", (_bo != null ? _bo.Warehouse_ID : 0))
                       .Add("Info1", "IN")
                       , BuVO).FirstOrDefault(x => x.Code.StartsWith("SRM"));

            return mcSRM;
        }

        public static act_McWork getMcWorkByQueueType(act_McObject _McObj, QueueType queueType, VOCriteria BuVO)
        {
            var mcWork = DataADO.GetInstant().SelectBy<act_McWork>(
                           ListKeyValue<string, object>
                           .New("QueueType", queueType)
                           .Add("IOType", IOType.INBOUND)
                           .Add("Sou_Location_ID", _McObj.Cur_Location_ID.GetValueOrDefault())
                           , BuVO).FirstOrDefault();
            return mcWork;
        }
    }

}
