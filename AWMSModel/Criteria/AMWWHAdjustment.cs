using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Criteria
{
    public class AMWWHAdjustment
    {
        public string amw_refId;
        public string adj_order;
        public string warehouse;
        public int company;
        public string status;
        public string message;
        public List<header> adj_order_d;

        public class header
        {
            public int wh_line;
            public string Item;
            public int Seq_Serial;
            public string serial;
            public string Lot;
            public string Loc;
            public string status;
            public string message;
            public double variance;
        }
    }
}
