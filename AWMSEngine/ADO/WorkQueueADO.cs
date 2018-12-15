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
            param.Add("@resID", null, System.Data.DbType.Int64, System.Data.ParameterDirection.Output);

            var data = this.Query<dynamic>("SP_QUEUE_MAP_DOCITEM", System.Data.CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction).First();
            queueDocItem.ID = (long)data.resID;


            return queueDocItem;
        }
        public SPworkQueue PUT(SPworkQueue obj, VOCriteria buVO)
        {
            var param = this.CreateDynamicParameters(obj, "Seq", "RefID");
            param.Add("ActionBy", buVO.ActionBy);

            /*param.Add("resID", null, System.Data.DbType.Int64, System.Data.ParameterDirection.Output);
            param.Add("resSeq", null, System.Data.DbType.Int32, System.Data.ParameterDirection.Output);
            param.Add("resRefID", null, System.Data.DbType.String, System.Data.ParameterDirection.Output);
            param.Add("resStoCode", null, System.Data.DbType.String, System.Data.ParameterDirection.Output);*/

            var data = this.Query<dynamic>("SP_QUEUE_PUT", System.Data.CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction).First();
            obj.ID = (long)data.resID;
            obj.Seq = (int)data.resSeq;
            obj.RefID = (string)data.resRefID;
            obj.StorageObject_Code = (string)data.resStoCode;


            return obj;
        }
    }
}
