
using AWCSModel.Entity;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWCSModel.Entity
{
    public class BaseEntityCreateOnly : BaseEntityID
    {
        public EntityStatus Status;
        public int CreateBy;
        public DateTime CreateTime;
    }
}
