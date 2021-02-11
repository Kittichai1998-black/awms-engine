using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Entity
{
    public class ams_Notify : BaseEntityCreateModify
    {
        public string Code;
        public string Name;
        public NotifyType NotifyType;
        public NotifyPriority Priority;
        public List<ams_Notify_User> notifyUsers;
    }
}
