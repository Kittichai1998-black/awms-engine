using AMWUtil.DataAccess;
using AMWUtil.PropertyFile;
using AWMSModel.Constant.StringConst;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.ADO
{
    public abstract class BaseMSSQLAccess<TThis> : AMWUtil.DataAccess.BaseDatabaseAccess
        where TThis : BaseMSSQLAccess<TThis>, new()
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
        protected BaseMSSQLAccess() 
            : base(PropertyFileManager.GetInstant().GetPropertyDictionary(PropertyConst.APP_KEY) == null ?
                  string.Empty:
                  PropertyFileManager.GetInstant().GetPropertyDictionary(PropertyConst.APP_KEY)[PropertyConst.APP_KEY_DBMSSQL_CONSTR])
        {
            _ConnectionStringDefault = this.ConnectionString;
        }

    }
    
}
