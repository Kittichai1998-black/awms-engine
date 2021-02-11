using AMWUtil.Exception;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Criteria.SP.Request;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ADO.WMSDB
{
    public class WorkQueueADO : BaseWMSDB<WorkQueueADO>
    {
        public SPworkQueue Get(long queueID, VOCriteria buVO)
        {
            var q = DataADO.GetInstant().SelectByID<amt_WorkQueue>(queueID, buVO);
            return SPworkQueue.Generate(q);
        }
        public SPworkQueue GetByID(long baseID, VOCriteria buVO)
        {
            var q = DataADO.GetInstant().SelectBy<amt_WorkQueue>(new SQLConditionCriteria[]{
                    new SQLConditionCriteria("StorageObject_ID", baseID, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Status", "0,1", SQLOperatorType.IN)
                }, buVO).FirstOrDefault();
            return SPworkQueue.Generate(q);
        }
        /// <summary>
        /// ไม่ได้ใช้งานแล้ว
        /// </summary>
        public SPworkQueue Create_LossVersion(SPworkQueue obj, VOCriteria buVO)
        {
            if (!obj.ID.HasValue)
                this.PUT(obj, buVO);

            if (obj.DocumentItemWorkQueues != null && obj.DocumentItemWorkQueues.Count() > 0)
                obj.DocumentItemWorkQueues
                    .FindAll(x => !x.ID.HasValue)
                    .ForEach(x => { x.WorkQueue_ID = obj.ID.Value; this.MappingDocItem(x, buVO); });

            return obj;
        }
        public amt_WorkQueueDocumentItem MappingDocItem(amt_WorkQueueDocumentItem queueDocItem, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("@documentItemID", queueDocItem.DocumentItem_ID);
            param.Add("@workQueueID", queueDocItem.WorkQueue_ID);
            param.Add("@qty", queueDocItem.Quantity);
            param.Add("@unitID", queueDocItem.UnitType_ID);
            param.Add("@baseQty", queueDocItem.BaseQuantity);
            param.Add("@baseUnitID", queueDocItem.BaseUnitType_ID);
            param.Add("@actionBy", buVO.ActionBy);

            var data = this.Query<dynamic>("SP_QUEUE_MAP_DOCITEM", System.Data.CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction).First();
            queueDocItem.ID = (long)data.resID;


            return queueDocItem;
        }
        public amt_WorkQueue PUT(amt_WorkQueue wq , VOCriteria buVO)
        {
            var spwq = PUT(SPworkQueue.Generate(wq), buVO);
            wq.ID = spwq.ID;
            wq.StorageObject_Code = spwq.StorageObject_Code;
            wq.RefID = spwq.RefID;
            wq.Seq = spwq.Seq;
            return wq;
        }
        public SPworkQueue PUT(SPworkQueue obj, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("ID", obj.ID);
            param.Add("IOType", obj.IOType);
            param.Add("Parent_WorkQueue_ID", obj.Parent_WorkQueue_ID);
            param.Add("StorageObject_ID", obj.StorageObject_ID);
            param.Add("ProductOwner_ID", obj.ProductOwner_ID); 
            param.Add("Sou_Warehouse_ID", obj.Sou_Warehouse_ID);
            param.Add("Sou_AreaMaster_ID", obj.Sou_AreaMaster_ID);
            param.Add("Sou_AreaLocationMaster_ID", obj.Sou_AreaLocationMaster_ID);
            param.Add("Warehouse_ID", obj.Warehouse_ID);
            param.Add("AreaMaster_ID", obj.AreaMaster_ID);
            param.Add("AreaLocationMaster_ID", obj.AreaLocationMaster_ID);
            param.Add("Des_Warehouse_ID", obj.Des_Warehouse_ID);
            param.Add("Des_AreaMaster_ID", obj.Des_AreaMaster_ID);
            param.Add("Des_AreaLocationMaster_ID", obj.Des_AreaLocationMaster_ID);
            param.Add("TargetStartTime", obj.TargetStartTime);
            param.Add("ActualTime", obj.ActualTime);
            param.Add("StartTime", obj.StartTime);
            param.Add("EndTime ", obj.EndTime);
            param.Add("EventStatus", obj.EventStatus);
            param.Add("Status", WMSStaticValue.StaticValueManager.GetInstant().GetStatusInConfigByEventStatus<WorkQueueEventStatus>(obj.EventStatus));
            param.Add("Priority", obj.Priority);
            param.Add("ActionBy", buVO.ActionBy);

            var data = this.Query<dynamic>("SP_QUEUE_PUT", System.Data.CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction).First();
            obj.ID = (long)data.resID;
            obj.Seq = (int)data.resSeq;
            obj.RefID = (string)data.resRefID;
            obj.StorageObject_Code = (string)data.resStoCode;


            return obj;
        }
    }
}
