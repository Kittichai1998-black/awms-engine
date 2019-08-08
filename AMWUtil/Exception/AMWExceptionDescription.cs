using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AMWUtil.Exception
{
    public class AMWExceptionDescription : Attribute
    {
        public string EN { get; set; }
        public string TH { get; set; }
        public string CN { get; set; }
    }
}
