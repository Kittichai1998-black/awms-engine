using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public class act_StorageObject : BaseEntityID
    {
        public string Code;
        public int McPosition_ID;
        public int StoBaseID;
        public string StoBaseCode;
        public string StoBaseName;
        public decimal StoBaseWeiKG;
        public string? StoProdCode;
        public string? StoProdName;
        public decimal? StoProdQty;
        public string? StoProdUnit;
    }
}
