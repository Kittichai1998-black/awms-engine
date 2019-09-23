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
        public List<SAPList> sapLists;
        public List<string> outTableNames;

        public class SAPList{
            public string inStructureName;
            public string inTableName;
            public Dictionary<string, object> datas;
        }
    }
}