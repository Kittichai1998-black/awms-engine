using System;
using System.Collections.Generic;
using System.Text;

namespace AWCSModel.Entity
{
    public class BaseEntityCreateModify : BaseEntityCreateOnly
    {
        public int? ModifyBy;
        public DateTime? ModifyTime;
    }
}
