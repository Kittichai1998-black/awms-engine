using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Criteria
{
    public class AMWWHInbound
    {
        public string amw_refId;
        public int wh_seqord; 
        public string wh_order;
        public int wh_origin;
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
            public List<items> wh_order_d;
        }
        public class items
        {
            public string Advice;
            public int Advice_line;
            public string item;
            public string proj_line;
            public string status;
            public string message;
        }

    }
}
