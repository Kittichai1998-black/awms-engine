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
            var param = this.CreateDynamicParameters(obj);
            param.Add("userid", buVO.ActionBy);
            var id = this.ExecuteScalar<long>("SP_QUEUE_PUT", System.Data.CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction);
            obj.ID = id;
            return obj;
        }
    }
}
