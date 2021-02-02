using ADO.WMSDB;
using AWMSEngine.Engine;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectGCL.Engine.Received
{
    public class ScanMappingandReceive : BaseEngine<ScanMappingandReceive.TReq, ScanMappingandReceive.TRes>
    {
        private StorageObjectADO ADOSto = ADO.WMSDB.StorageObjectADO.GetInstant();

      
        public class TReq
        {
            public long? locationID;
        }

        public class TRes
        {
            public long? locationID; 
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            throw new NotImplementedException();
        }

    }
}
