using AMWUtil.DataAccess;
using AMWUtil.PropertyFile;
using AWMSModel.Constant.StringConst;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace ADO
{
    public abstract class BaseWMSDB<TThis> : AMWUtil.DataAccess.BaseDatabaseAccess
        where TThis : BaseWMSDB<TThis>, new()
    {
        private static TThis instants;
        public static TThis GetInstant(string connectionString = null)
        {
            if (instants == null)
                instants = new TThis();

            if (!string.IsNullOrEmpty(connectionString))
                instants.ConnectionString = connectionString;
            else
                instants.ConnectionString = instants._ConnectionStringDefault;

            return instants;
        }
        private string _ConnectionStringDefault;
        protected BaseWMSDB() 
            : base(PropertyFileManager.GetInstant().Get(PropertyConst.APP_KEY) == null ?
                  string.Empty:
                  PropertyFileManager.GetInstant().Get(PropertyConst.APP_KEY)[PropertyConst.APP_KEY_MSSQL_CONSTR_WMS])
        {
            _ConnectionStringDefault = this.ConnectionString;
        }

    }
    
}
