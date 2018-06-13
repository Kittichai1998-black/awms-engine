using AMWUtil.PropertyFile;
using AWMSModel.Constant.StringConst;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.ADO
{
    public abstract class BaseMSSQLAccess : AMWUtil.DataAccess.BaseDatabaseAccess
    {
        public BaseMSSQLAccess() 
            : base(PropertyFileManager.GetInstant().GetPropertyDictionary(PropertyConst.APP_KEY)[PropertyConst.APP_KEY_DBMSSQL_CONSTR])
        {

        }
    }
}
