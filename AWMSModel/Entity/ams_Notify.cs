using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public class ams_Notify : BaseEntityCreateModify
    {
        public string Code;
        public string Name;
        public int NotifyType;
        public int Priority;
        public List<ams_Notify_User> notifyUsers;
    }
}
