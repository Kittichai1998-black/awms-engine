using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Criteria
{
    public class ERPWHAdjustment
    {
        public string adj_order;
        public string warehouse;
        public string amw_refId;
        public int company;
        public List<header> adj_order_d;

        public class header
        {
            public int wh_line;
            public string Item;
            public int Seq_Serial;
            public string serial;
            public string Loc;
            public string Lot;
            public double variance;



        }

    }
}
