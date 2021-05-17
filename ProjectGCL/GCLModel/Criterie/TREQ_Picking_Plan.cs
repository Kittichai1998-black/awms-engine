using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWCSWebApp.GCLModel.Criterie
{
    public class TREQ_Picking_Plan
    {
        public TRecord RECORD;
        public class TRecord
        {
            public List<TLine> LINE;
            public class TLine
            {

                public string API_REF;
                public DateTime API_DATE_TIME;
                public string DOC_STATUS;
                public string PICK_GROUP;
                public string WMS_DOC;
                public string CUSTOMER_CODE;
                public string ACTIVIT_YTYPE;
                public List<TPICK_DETAIL> PICK_DETAIL;
                public class TPICK_DETAIL
                {
                    public string WMS_LINE;
                    public string SKU;
                    public string LOT;
                    public decimal QTY;
                    public string UNIT;
                    public string UD_CODE;
                    public string FROM_WH_ID;
                    public string FROM_LOCATION;
                    public string TO_Location_Staging;
                    public string TO_Location_Destination;
                    public string PRIORITY;

                }
            }
        }
    }
}
