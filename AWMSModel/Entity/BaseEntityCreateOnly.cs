using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Entity
{
    public class BaseEntityCreateOnly : BaseEntityID
    {
        public EntityStatus Status;
        public int CreateBy;
        public DateTime CreateTime;
    }
}
