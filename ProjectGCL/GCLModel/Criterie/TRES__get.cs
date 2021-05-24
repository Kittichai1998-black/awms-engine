using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectGCL.GCLModel.Criterie
{
    public class TRES__get
    {
        public string API_REF;
        public DateTime Date_time;
        public TResult _result;
        public class TResult
        {
            public int status;
            public string message;
        }
    }
}
