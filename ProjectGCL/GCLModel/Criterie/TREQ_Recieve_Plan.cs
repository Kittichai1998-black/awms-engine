using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWCSWebApp.GCLModel.Criterie
{
    public class TREQ_Recieve_Plan
    {
        public string API_REF;
        public DateTime API_DATE_TIME;
        public string WMS_DOC;
        public string CUSTOMER_CODE;
        public decimal QTY;
        public string UNIT;
        public string STATUS;
        public string TO_WH_ID;
        public List<TPallet_Detail> Pallet_Detail;
        public class TPallet_Detail
        {
            string TO_LOCATION;
            string PALLET_NO;
            string PALLET_STATUS;
            string GRADE_Barcode;
            string LOT_Barcode;
            string NO_Barcode;
            string SKU;
            DateTime MFG;
            DateTime EXP;
            string UD_CODE;
            string LOT;
            decimal QTY_Pallet;
            string UNIT;
        }
    }
}
