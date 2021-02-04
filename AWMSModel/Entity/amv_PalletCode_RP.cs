using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Entity
{
    public class amv_PalletCode_RP : IEntityModel
    {
        public long BaseID;
        public string BaseCode;
        public long PackID;
        public string PackCode;
        public string PackName;
        public string Batch;
        public long PackMasterID;
        public string UnitCode;
        public decimal Quantity;
    }
}
