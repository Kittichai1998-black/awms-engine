using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AMWUtil.Exception
{
    public class AMWExceptionCodeAttribute : Attribute
    {
        public string Code { get; set; }
        public string DefaultMessage { get; set; }
        public AMWExceptionCodeAttribute(string Code)
        {
            this.Code = Code;
        }
    }
}
