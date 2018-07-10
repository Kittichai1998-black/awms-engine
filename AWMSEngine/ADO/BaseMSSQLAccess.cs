using AMWUtil.DataAccess;
using AMWUtil.PropertyFile;
using AWMSModel.Constant.StringConst;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.ADO
{
    public abstract class BaseMSSQLAccess<TThis> : AMWUtil.DataAccess.BaseDatabaseAccess
        where TThis : BaseDatabaseAccess, new()
    {
        private static Dictionary<string,TThis> instants;
        public static TThis GetInstant()
        {
            string key = typeof(TThis).Name;
            if(instants == null)
                instants = new Dictionary<string, TThis>();
            if (!instants.ContainsKey(key)){
                instants.Add(key, new TThis());
            }
            return instants[key];
        }

        protected BaseMSSQLAccess() 
            : base(PropertyFileManager.GetInstant().GetPropertyDictionary(PropertyConst.APP_KEY)[PropertyConst.APP_KEY_DBMSSQL_CONSTR])
        {

        }
    }
    
}
