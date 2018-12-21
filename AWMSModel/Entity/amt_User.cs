using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public class amt_User : BaseEntityCreateModify
    {
        public string Code;
        public string Name;
        public string Password;
        public string SoftPassword;
        public string EmailAddress;
        public string LineID;
        public string FacebookID;
        public string TelOffice;
        public string TelMobile;
        public int? Revision;
    }
}
