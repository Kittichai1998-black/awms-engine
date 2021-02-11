using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Entity
{
    public class amv_CurrentInv : IEntityModel
    {
        public int ID;
        public string PackCode;
        public string PackName;
        public string Warehouse;
        public int Total;
        public int skuQty;
    }
}
