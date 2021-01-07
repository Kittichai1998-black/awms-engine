using System;
using System.Collections.Generic;
using System.Text;

namespace GCLModel.Criteria
{
    public class AMWRequestCreateDoc
    {
        public string api_ref;
        public string doc_wms; 
        public string customer;
        public string sku;
        public string grade;
        public string company;
        public int start_pallet;
        public int end_pallet;
        public decimal qty;
        public decimal qty_per_pallet;
        public string unit;
        public string status;
        public int warehouse;
        public int? discharge;

    }
}
