using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectGCL.GCLModel.Criterie
{
    public class TRES_Request_CAP
    {
        public string API_REF;
        public DateTime Date_time;
        public List<TWH_CAP> WH_CAP;
        public class TWH_CAP
        {
            public string WH_ID;
            public string RACK_TYPE;
            public decimal PALLET_QTY;
        }
    }
}
