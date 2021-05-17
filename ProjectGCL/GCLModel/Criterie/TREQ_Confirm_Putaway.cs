using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWCSWebApp.GCLModel.Criterie
{
    public class TREQ_Confirm_Putaway
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
                public string TO_WH_ID;
                public List<TPallet_Detail> Pallet_Detail;
                public class TPallet_Detail
                {
                    public string TO_LOCATION;
                    public string PALLET_NO;
                    public decimal QTY_Pallet;
                    public string SKU;
                    public string LOT;
                    public string UNIT;
                }

            }
        }
    }
}
