using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.ADO.WMSDB
{
    public class PermissionADO : BaseMSSQLAccess<PermissionADO>
    {
        public List<ams_Permission> ListByUser(long userID, VOCriteria buVO)
        {
            var param = new Dapper.DynamicParameters();
            param.Add("@userID", userID);
            var res = this.Query<ams_Permission>(
                                "SP_PERMISSION_LIST_BY_USER",
                                CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction).ToList();
            return res;
        }
        
    }
}
