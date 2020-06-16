using System;
using System.Collections.Generic;
using System.Text;

namespace AMWUtil.Exception
{
    public class AMWExceptionModel
    {
        public AMWExceptionCode Code;
        public string[] Parameters;
        public AMWExceptionModel(AMWExceptionCode code,params string[] args)
        {
            this.Code = code;
            this.Parameters = args;
        }
    }
}
