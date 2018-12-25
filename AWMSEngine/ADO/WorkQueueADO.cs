using AMWUtil.Exception;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Request;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.ADO
{
    public class WorkQueueADO : BaseMSSQLAccess<WorkQueueADO>
    {
        public SPworkQueue Get(long queueID, VOCriteria buVO)
        {
            var q = ADO.DataADO.GetInstant().SelectByID<amt_WorkQueue>(queueID, buVO);
            return SPworkQueue.Generate(q);
        }
        public SPworkQueue Create(SPworkQueue obj, VOCriteria buVO)
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
        public SPworkQueue PUT(SPworkQueue obj, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("ID", obj.ID);
            param.Add("IOType", obj.IOType);
            param.Add("Parent_WorkQueue_ID", obj.Parent_WorkQueue_ID);
            param.Add("StorageObject_ID", obj.StorageObject_ID);
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
            param.Add("Status", obj.Status);
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
