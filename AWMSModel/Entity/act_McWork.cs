using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Entity
{
    public class act_McWork : BaseEntityCreateModify
    {
        public string Command;
        public long? StoObject_ID;
        public long? Sou_Location_ID;
        public long? Des_Location_ID;
        public long? Location_ID;

        public int PlcStatus;
        public McObjectEventStatus EventStatus;

    }
}
