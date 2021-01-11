﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace GCLModel.Criteria
{
    public class AMWRequestCreateDoc
    {

        //[Required(ErrorMessage = "kor wor yor")]
        
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
            public string sou_warehouse;
            public string des_warehouse;
            public string discharge;

    }
}