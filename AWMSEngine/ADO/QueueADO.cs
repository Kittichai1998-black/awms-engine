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
    public class QueueADO : BaseMSSQLAccess<QueueADO>
    {
        public SPworkQueue PUT(SPworkQueue obj, VOCriteria buVO)
        {
            var param = this.CreateDynamicParameters(obj, "Seq", "RefID", "StorageObject_Code");
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
