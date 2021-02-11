using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Criteria
{
    public class ERPRetuenWHInboundClosed
    {

        public string amw_refId;
        public int wh_seqord;
        public string wh_order;
        public string wh_origin;
        public int wh_set;
        public int company;
        public string status;
        public string message;
        public List<header> wh_order_h;

        public class header
        {
            public int wh_seq_order;
            public int wh_orderLine;
            public int wh_Sequence;
            public string status;
            public string message;
            public List<items> wh_order_d;
        }
        public class items
        {
            public string Advice;
            public int Advice_line;
            public string item;
            public string proj_line;
            public string Warehouse;
            public string Location;
            public string Lot;
            public string Serial;
            public string status;
            public string message;
        }
    }
}
