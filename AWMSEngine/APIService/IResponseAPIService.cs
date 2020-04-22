﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService
{
    public interface IResponseAPIService
    {
        Result _result { get; set; }
        public class Result
        {
            int status;
            string code;
            string message;
        }
    }
}
