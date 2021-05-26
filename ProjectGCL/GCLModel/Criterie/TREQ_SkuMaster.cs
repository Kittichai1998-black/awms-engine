using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectGCL.GCLModel.Criterie
{
    public class TREQ_SkuMaster
    {
        public TRecord RECORD;
        public class TRecord
        {
            public List<TLine> LINE;
            public class TLine
            {
                public string API_REF;
                public string API_STATUS;
                public DateTime API_Date_Time;
                public string SKU;
                public string SKU_DES;
                public string GRADE;
                public string BASE_UNIT;
                public string PALLET_TYPE;
                public string TYPE_BAG;
                public decimal QTY_BAG;
                public decimal BAG_PALLET;
                public decimal QTY_PALLET;
                public string NO_LAYER;
                public string ONE_LAYER;
                public DateTime CREATE_DATE;
                public string CUSTOMER_CODE;
            }
        }
    }
}
