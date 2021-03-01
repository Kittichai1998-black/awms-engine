using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Criteria
{
    public class ResponseCriteria<TRes>
    {
        public TRes result;
        public int status;
        public string message;
        public string trace;
    }
}
