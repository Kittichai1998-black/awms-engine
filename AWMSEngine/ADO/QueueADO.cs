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
    public class QueueADO : BaseMSSQLAccess<MasterADO>
    {
        public List<amt_WorkQueue> PUT(SPworkQueue obj, VOCriteria buVO)
        {
            var param = this.CreateDynamicParameters(obj);
            param.Add("userid", buVO.ActionBy);

            var res = this.Query<amt_WorkQueue>("SP_QUEUE_PUT", System.Data.CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction).ToList();
            return res;
        }
    }
}
