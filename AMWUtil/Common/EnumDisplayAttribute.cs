using System;
using System.Collections.Generic;
using System.Text;

namespace AMWUtil.Common
{
    public class EnumDisplayAttribute : Attribute
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public int Order { get; set; }
        public string Icon { get; set; }
    }
}
