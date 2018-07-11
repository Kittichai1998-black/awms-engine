using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Response;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.ADO
{
    public class StorageObjectADO : BaseMSSQLAccess<StorageObjectADO>
    {
        public StorageObjectCriteria Get(string code, bool isToRoot, AMWUtil.Logger.AMWLogger logger = null)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("@code", code);
            param.Add("@isToRoot", isToRoot);
            var r = this.Query<SPStorageObjectCriteria>("SP_STO_GET", System.Data.CommandType.StoredProcedure, param, logger)
                    .ToList();
            StorageObjectCriteria res = StorageObjectCriteria.Generate(r, code);
            return res;
        }
        public int GetRootID(string code, StorageObjectType rootType, AMWUtil.Logger.AMWLogger logger = null)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("@code", code);
            param.Add("@rootType", rootType);
            param.Add("@rootID", System.Data.ParameterDirection.Output);
            this.Query<int>("SP_STO_GETROOTID", System.Data.CommandType.StoredProcedure, param, logger);
            return param.Get<int>("@rootID");
        }
        public int GetFreeCount(string code,bool isInStorage, AMWUtil.Logger.AMWLogger logger = null)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("code", code);
            param.Add("isInStorage", isInStorage);
            int res = 0;
            param.Add("res", res, System.Data.DbType.Int32, System.Data.ParameterDirection.Output);
            this.Query<int>("SP_STO_FREE_COUNT", System.Data.CommandType.StoredProcedure, param, logger);
            var xxx = param.Get<int>("res");
            return xxx;
        }
    }
    
}
