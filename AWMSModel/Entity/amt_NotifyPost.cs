using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public class amt_NotifyPost : BaseEntityCreateModify
    {
        public long Notify_ID;
        public string Title;
        public string Message;
        public string Tag1;
        public string Tag2;
        public DateTime PostTime;
    }
}
