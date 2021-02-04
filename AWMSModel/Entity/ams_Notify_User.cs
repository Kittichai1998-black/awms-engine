using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Entity
{
    public class ams_Notify_User : BaseEntityCreateModify
    {
        public int User_ID;
        public int Notify_ID;
        public bool IsSendToEmail;
        public bool IsSendToLine;
        public bool IsSendToFacebook;
        public bool IsSendToAMS;
    }
}
