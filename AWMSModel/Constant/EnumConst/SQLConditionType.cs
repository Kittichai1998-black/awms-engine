using AMSModel.Criteria.Attribute;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Constant.EnumConst
{
    public enum SQLConditionType
    {
        [ValueAttribute("")]
        NONE,
        [ValueAttribute("AND")]
        AND,
        [ValueAttribute("OR")]
        OR
    }
}
