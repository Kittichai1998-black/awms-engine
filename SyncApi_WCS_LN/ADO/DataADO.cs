using AMWUtil.Logger;
using SyncApi_WCS_LN.Const;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SyncApi_WCS_LN.ADO
{
    public class DataADO : AMWUtil.DataAccess.BaseDatabaseAccess
    {
        private static DataADO _instant { get; set; }
        public static DataADO GetInstant()
        {
            if (_instant == null)
                _instant = new DataADO();
            return _instant;
        }

        private DataADO() : base(ConfigADO.DatatbaseConfigs[ConfigString.KEY_DB_CONNECTIONSTRING])
        {
        }

        public List<T> Query<T>(string sp_name, AMWLogger logger, object parameters = null)
        {
            Dapper.DynamicParameters p = parameters == null ? null : this.CreateDynamicParameters(parameters);
            List<T> res  = this.Query<T>(sp_name, System.Data.CommandType.StoredProcedure, p, logger).ToList();
            return res;
        }
    }
}
