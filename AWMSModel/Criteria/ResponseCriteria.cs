using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Criteria
{
    public class ResponseCriteria<TRes>
    {
        public TRes datas;
        public Result _result;
        public class Result
        {
            public int status;
            public string message;
            public string trace;
        }
    }
}
