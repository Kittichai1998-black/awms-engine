using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ProjectSTA_SAPConnect.Models
{
    public class RequestCriteria
    {
        public string environmentName;
        public string functionName;
        public Dictionary<string, object> datas;
    }
}