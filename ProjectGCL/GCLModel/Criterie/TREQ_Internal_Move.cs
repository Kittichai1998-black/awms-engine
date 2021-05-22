using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectGCL.GCLModel.Criterie
{
    public class TREQ_Internal_Move
    {
        public TRecord RECORD;
        public class TRecord
        {
            public List<TLine> LINE;
            public class TLine
            {
                public string API_REF;
                public DateTime API_DATE_TIME;
                public string WMS_DOC;
                public string CUSTOMER_CODE;
                public string FROM_LOCATION;
                public string TO_LOCATION;
                public List<TPallet_Detail> Pallet_Detail;
                public class TPallet_Detail
                {
                    string PALLET_NO;
                    decimal QTY_Pallet;
                    string SKU;
                    string LOT;
                    string UNIT;
                }

            }
        }
    }
}
