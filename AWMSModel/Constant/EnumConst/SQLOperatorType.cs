using AWMSModel.Criteria.Attribute;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Constant.EnumConst
{
    public enum SQLOperatorType
    {
        [ValueAttribute("=")]
        EQUALS,
        [ValueAttribute(">")]
        MORE,
        [ValueAttribute("<")]
        LESS,
        [ValueAttribute(">=")]
        MORE_EQUALS,
        [ValueAttribute("<=")]
        LESS_EQUALS,
        [ValueAttribute("LIKE")]
        LIKE
    }
}
