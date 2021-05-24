using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectGCL.GCLModel.Criterie
{
    public class TREQ_Allocated_LPN
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
                public string WMS_LINE;
                public string CUSTOEMR_CODE;
                public string WH_ID;
                public string LOCATION_FROM;
                public string Location_Staging;
                public List<TPallet_Detail> Pallet_Detail;
                public class TPallet_Detail
                {
                    public string PALLET_NO;
                    public decimal QTY_Pallet;
                    public decimal QTY_Pick;
                    public string SKU;
                    public string LOT;
                    public string UNIT;
                }

            }
        }

    }
}
