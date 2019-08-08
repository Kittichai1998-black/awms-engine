using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public class BaseEntityCreateModify : BaseEntityCreateOnly
    {
        public int? ModifyBy;
        public DateTime? ModifyTime;
    }
}
