using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ADO.WCSDB
{
   public  class CallStoreOutbound : BaseWCSDB <CallStoreOutbound>
    {
        public void SP_PROCESSOUTBOUND()
        {
            this.Query<dynamic>("SP_PROCESSOUTBOUND", System.Data.CommandType.StoredProcedure, null,null);
          
        
        }

        public void SP_PROCESSINBOUND()
        {
            this.Query<dynamic>("SP_PROCESSINBOUND", System.Data.CommandType.StoredProcedure, null, null);


        }
    }
}
