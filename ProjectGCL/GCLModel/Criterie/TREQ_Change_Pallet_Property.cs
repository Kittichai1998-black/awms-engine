using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectGCL.GCLModel.Criterie
{
    public class TREQ_Change_Pallet_Property
    {
        public TRecord RECORD;
        public class TRecord
        {
            public List<TLine> LINE;
            public class TLine
            {
                public string API_REF;
                public DateTime API_Date_Time;
                public string DOC_STATUS;
                public string WMS_DOC;
                public string SKU_TO;
                public string LOT_TO;
                public string UD_CODE_TO;
                public List<TPallet_Detail> Pallet_Detail;
                public class TPallet_Detail
                {
                    public string PALLET_NO;
                    public decimal QTY_Pallet;
                    public string SKU_FROM;
                    public string LOT;
                    public string UD_CODE_FROM;
                    public string UNIT;
                }

            }
        }

    }
}
