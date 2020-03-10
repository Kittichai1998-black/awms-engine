using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectTMC.Model.Criteria
{
    public class SCADACriteria
    { 
        public class SCADA_SendLocation_REQ
        {
            public string PalletCode;
            public string LocationCode;
            public string PackCode;
            public decimal? Quantity;
        }

        public class SCADA_SendConfirm_REQ
        {
            public string PalletCode;
            public string PackCode;
            public decimal? Quantity;
        }

    }
}
