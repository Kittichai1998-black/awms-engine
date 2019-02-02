using AMWUtil.DataAccess;
using AMWUtil.PropertyFile;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace WCSSimAPI.ADO
{
    public abstract class BaseMSSQLAccess<TThis> : AMWUtil.DataAccess.BaseDatabaseAccess
        where TThis : BaseDatabaseAccess, new()
    {
        private static TThis instants;
        public static TThis GetInstant()
        {
            if (instants == null)
                instants = new TThis();
            return instants;
        }

        protected BaseMSSQLAccess() 
            : base(ConstConfig.DBConnection)
        {

        }

    }
    
}
