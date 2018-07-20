using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Constant.EnumConst
{
    public enum DocumentType
    {
        RECEIVE_PRE = 10,
        RECEIVE_NORMAL = 11,
        RECEIVE_RETURN = 12,
        RETRIEVE_ORDER = 20,
        RETRIEVE_EDIT = 21,
        RETRIEVE_BACK = 22,
        AUDIT = 90,
        LOADING = 91,
        SHIPPING = 92,
    }
}
