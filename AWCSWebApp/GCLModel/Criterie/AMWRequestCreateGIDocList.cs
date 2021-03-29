using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace AWCSWebApp.GCLModel.Criteria
{
    public class AMWRequestCreateGIDocList
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
            public decimal? qty;
            public decimal qty_per_pallet;
            public string unit;
            public string status;
            public string warehouse; //Sou
            public string staging;
            public string Dock_no;
            public int Priority;
            public string group_task;
            public DateTime Date_time;
            public List<string> List_Pallet;

        }

    }
}
