using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SAPNCO.Models
{
    public class RequestCriteria
    {
        public string environmentName;
        public string functionName;
        public string inStructureName;
        public string inTableName;
        public string outTableName;
        public Dictionary<string, object> datas;
    }
}