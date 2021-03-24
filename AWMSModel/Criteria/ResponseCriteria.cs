using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Criteria
{
    public class ResponseCriteria<TRes>
    {
        public TRes data;
        public Result result;
        public class Result
        {
            public int status;
            public string message;
            public string trace;
        }
    }
}
