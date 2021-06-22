using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectGCL.GCLModel.Criterie
{
    public class TREQ_Recieve_Plan
    {
        public TRecord RECORD;
        public class TRecord
        {
            public List<TLine> LINE;
            public class TLine
            {
                public string BookZone = "inbound";
                public bool IsFromAMS = false;
                public string API_REF;
                public DateTime API_DATE_TIME;
                public string WMS_DOC;
                public string CUSTOMER_CODE;
                public decimal QTY;
                public string UNIT;
                public string STATUS;
                public string TO_WH_ID;
                public int BookCount;
                public List<TPallet_Detail> Pallet_Detail;
                public class TPallet_Detail
                {
                    public string TO_LOCATION;
                    public string PALLET_NO;
                    public string PALLET_STATUS;
                    public string GRADE_Barcode;
                    public string LOT_Barcode;
                    public string NO_Barcode;
                    public string SKU;
                    public DateTime? MFG;
                    public DateTime? EXP;
                    public string UD_CODE;
                    public string LOT;
                    public decimal QTY_Pallet;
                    public string UNIT;
                }

            }
        }
    }
}
