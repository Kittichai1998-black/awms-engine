using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Criteria
{
    public class ERPWHCounting
    {
        public string count_order;
        public int count_num;
        public string warehouse;
        public string amw_refId;
        public int company;
        public List<header> count_order_h;

        public class header
        {
            public int wh_line;
            public string Item;
            public string proj;
            public int Seq_Serial;
            public string serial;
            public string Loc;
            public string Lot;
            public double stock_inv;
            public double inv_counted;

        }
      
    }
}
