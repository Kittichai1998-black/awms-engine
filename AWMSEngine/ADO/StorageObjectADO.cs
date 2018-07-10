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
        public StorageObjectCriteria GetStorageObjectByRelationCode(string code,bool isToRoot, AMWUtil.Logger.AMWLogger logger = null)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("@code", code);
            param.Add("@isToRoot", isToRoot);
            var r = this.Query<SPStorageObjectCriteria>("SP_GET_STORAGEOBJECT_BY_RELATIONCODE", System.Data.CommandType.StoredProcedure, param, logger)
                    .ToList();
            StorageObjectCriteria res = StorageObjectCriteria.Generate(r, code);
            return res;
        }
    }
}
