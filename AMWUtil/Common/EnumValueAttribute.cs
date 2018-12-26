using System;
using System.Collections.Generic;
using System.Text;

namespace AMWUtil.Common
{
    public class EnumValueAttribute : Attribute
    {
        public double ValueDouble { get; set; }
        public int ValueInt { get; set; }
        public string ValueString { get; set; }
    }
}
