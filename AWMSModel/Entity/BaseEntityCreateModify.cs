using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public class BaseEntityCreateModify : IEntityModel
    {
        public EntityStatus Status;
        public int CreateBy;
        public DateTime CreateTime;
        public int ModifyBy;
        public DateTime ModifyTime;
    }
}
