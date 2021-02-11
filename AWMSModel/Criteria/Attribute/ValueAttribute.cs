using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Criteria.Attribute
{
    public class ValueAttribute : System.Attribute
    {
        public string Value { get; set; }
        public ValueAttribute(string value)
        {
            this.Value = value;
        }
    }
}
