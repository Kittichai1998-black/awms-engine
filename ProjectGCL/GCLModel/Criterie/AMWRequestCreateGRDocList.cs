using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace GCLModel.Criteria
{
    public class AMWRequestCreateGRDocList
    {

        public List<RECORD_LIST> RECORD;

        public class RECORD_LIST
        {
            public LINELIST LINE;
        }
        public class LINELIST
        {
            public string api_ref;
            public string doc_wms;
            public string customer;
            public string sku;
            public string grade;
            public string lot;
            public int? start_pallet;
            public int? end_pallet;
            public decimal? qty;
            public decimal? qty_per_pallet;
            public string unit;
            public string status;
            public string warehouse; //Des
            public string discharge;
            public string Check_recieve;
            public string[] List_Pallet;
            public DateTime Date_time;



        }

    }
}
