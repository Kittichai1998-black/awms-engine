using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public abstract class BaseEntitySTD : IEntityModel
    {
        public int ID;
        public string Code;
        public string Description;
        public EntityStatus Status;
        public int CreateBy;
        public DateTime CreateTime;
        public int ModifyBy;
        public DateTime ModifyTime;
    }
}
