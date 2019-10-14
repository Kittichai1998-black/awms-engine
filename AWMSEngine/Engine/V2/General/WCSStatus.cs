﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace AWMSEngine.Engine.V2.General
{
    public class WCSStatus : BaseEngine<WCSStatus.TReq, string>
    {
        public class TReq
        {
            public List<MachineDetail> MachineStatus;
            public class MachineDetail
            {
                public string MachineType;
                public string AreaCode;
                public string Status;
                public string Description;
                public DateTime DateTime;
                public bool ErrorFlag;
            }
        }

        protected override string ExecuteEngine(TReq reqVO)
        {
            var res = JsonConvert.SerializeObject(reqVO);
            return res;
        }
    }
}