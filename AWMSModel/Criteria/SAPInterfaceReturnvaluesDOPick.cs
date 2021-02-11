using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Criteria
{
 public class SAPInterfaceReturnvaluesDOPick
    {
        public List<items> ITEM_DATA;
        public class items
        {
            public string DELIV_NUMB;
            public string DELIV_ITEM;
            public string MATERIAL;
            public string PLANT;
            public string STGE_LOC;
            public string BATCH;
            public string DLV_QTY;
            public string SALES_UNIT;
            public string MOVE_PLANT;
        }

    }
}
