using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace AWMSEngine.Engine.V2.General
{
    public class WMSAlert : BaseEngine<WMSAlert.TReq, string>
    {
        public class TReq
        {
            public List<Detail> messages;
            public class Detail
            {
                public string code;
                public string title;
                public int message;
                public string alertType;
                public DateTime actionTime;
            }
        }

        protected override string ExecuteEngine(TReq reqVO)
        {
            var res = JsonConvert.SerializeObject(reqVO);
            return res;
        }
    }
}
