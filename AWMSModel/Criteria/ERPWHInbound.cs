using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Criteria
{
    public class ERPWHInbound
    {
        public int wh_seqord;
        public string wh_order;
        public int wh_set;
        public int company;
        public string cust;
        public int wh_origin;
        public string proj;
        public string amw_refId;
        public List<header> wh_order_h;
      
        public class header
        {
            public int wh_seq_order;
            public int wh_orderLine;
            public int wh_Sequence;
            public List<items> wh_order_d;
        }
        public class items
        {
            public string Advice;
            public int Advice_line;
            public string item;
            public string proj_line;
            public string warehouse_f;
            public string warehouse_t;
            public string item_group;
            public string inventory_unit;
            public string Location;
            public string Lot;
            public string Serial;
            public double Advised_qty;
            public string Receipt;
            public int Receipt_line;
            public int update_r;
        }
       


    }
}
