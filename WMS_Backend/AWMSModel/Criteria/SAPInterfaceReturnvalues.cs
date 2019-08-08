using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Criteria
{
    public class SAPInterfaceReturnvalues
    {
        public header GOODSMVT_HEADER;
        public List<items> GOODSMVT_ITEM;
        public class header
        {
            public string PSTNG_DATE;
            public string DOC_DATE;
            public string REF_DOC_NO;
            public string HEADER_TXT;
            public string GOODSMVT_CODE;
        }
        public class items
        {
            public string MATERIAL;
            public string PLANT;
            public string STGE_LOC;
            public string BATCH;
            public string MOVE_TYPE;
            public decimal ENTRY_QNT;
            public string ENTRY_UOM;
            public string MOVE_PLANT;
            public string MOVE_STLOC;
        }

    }
}
