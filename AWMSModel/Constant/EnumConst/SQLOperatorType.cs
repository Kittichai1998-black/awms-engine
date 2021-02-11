using AMSModel.Criteria.Attribute;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Constant.EnumConst
{
    public enum SQLOperatorType
    {
        [ValueAttribute("=")]
        EQUALS,
        [ValueAttribute("!=")]
        NOTEQUALS,
        [ValueAttribute("IS NULL")]
        ISNULL,
        [ValueAttribute("IS NOT NULL")]
        ISNOTNULL,
        [ValueAttribute(">")]
        MORE,
        [ValueAttribute("<")]
        LESS,
        [ValueAttribute(">=")]
        MORE_EQUALS,
        [ValueAttribute("<=")]
        LESS_EQUALS,
        [ValueAttribute("LIKE")]
        LIKE,
        [ValueAttribute("NOT LIKE")]
        NOTLIKE,
        [ValueAttribute("IN")]
        IN,
        [ValueAttribute("NOT IN")]
        NOTIN
    }
}
