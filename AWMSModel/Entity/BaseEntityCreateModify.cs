using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Entity
{
    public class BaseEntityCreateModify : BaseEntityCreateOnly
    {
        public int? ModifyBy;
        public DateTime? ModifyTime;
    }
}
