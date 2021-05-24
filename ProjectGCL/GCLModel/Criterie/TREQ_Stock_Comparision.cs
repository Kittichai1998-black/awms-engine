using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectGCL.GCLModel.Criterie
{
    public class TREQ_Stock_Comparision
    {
        public TRecord RECORD;
        public class TRecord
        {
            public List<TLine> LINE;
            public class TLine
            {
                public string API_REF;
                public DateTime API_DATE_TIME;
                public string WH_ID;
                public string CUSTOMER_CODE;
                public string SKU;
                public string LOT;
                public string UD_CODE;

            }
        }
    }
}
