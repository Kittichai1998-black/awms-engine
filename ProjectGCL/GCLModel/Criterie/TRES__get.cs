﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWCSWebApp.GCLModel.Criterie
{
    public class TRES__get
    {
        public string API_REF;
        public DateTime Date_time;
        public List<TResult> _result;
        public class TResult
        {
            public int status;
            public string message;
        }
    }
}
