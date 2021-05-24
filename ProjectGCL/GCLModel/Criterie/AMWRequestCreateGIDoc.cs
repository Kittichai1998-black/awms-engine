﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace ProjectGCL.GCLModel.Criteria
{
    public class AMWRequestCreateGIDoc
    {

        //[Required(ErrorMessage = "kor wor yor")]
        
            public string api_ref;
            public string doc_wms;
            public string customer;
            public string sku;
            public string grade;
            public string lot;
            public decimal? qty;
            public string unit;
            public string status;
            public string warehouse; //Sou
            public string staging;
            public string Dock_no;
            public decimal Priority;
            public string Group_Task;
            public DateTime Date_time;

    }
}
