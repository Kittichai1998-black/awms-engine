using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectGCL.GCLModel.Criterie
{
    public class TREQ_Request_CAP
    {
        public TRecord RECORD;
        public class TRecord
        {
            public List<TLine> LINE;
            public class TLine
            {

                public string API_REF;
                public DateTime API_Date_Time;
                public string WMS_DOC;
                public string CUSTOMER_CODE;
                public string SKU;
                public string LOT;
                public string UD_CODE;
            }
        }
    }
}
