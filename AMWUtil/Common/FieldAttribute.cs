using System;
using System.Collections.Generic;
using System.Text;

namespace AMWUtil.Common
{
    public class FieldAttribute : Attribute
    {
        public bool IsDbField { get; set; }
    }
}
