using AMWUtil.DataAccess;
using AMWUtil.PropertyFile;
using AWMSModel.Constant.StringConst;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.ADO
{
    public abstract class BaseMSSQLAccess<T> : AMWUtil.DataAccess.BaseDatabaseAccess
        where T : BaseDatabaseAccess, new()
    {
        private static Dictionary<string,T> instants;
        public static T GetInstant()
        {
            string key = typeof(T).Name;
            if(instants == null)
                instants = new Dictionary<string, T>();
            if (!instants.ContainsKey(key)){
                instants.Add(key, new T());
            }
            return instants[key];
        }

        public BaseMSSQLAccess() 
            : base(PropertyFileManager.GetInstant().GetPropertyDictionary(PropertyConst.APP_KEY)[PropertyConst.APP_KEY_DBMSSQL_CONSTR])
        {

        }
    }
    
}
