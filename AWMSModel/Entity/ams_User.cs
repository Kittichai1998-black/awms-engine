using AMWUtil.Common;
using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public class ams_User : BaseEntitySTD
    {
        public string Password;
        public string SaltPassword;
        public string EmailAddress;
        public string LineID;
        public string FacebookID;
        public string TelOffice;
        public string TelMobile;
        public int? Revision;

        public static string HashPassword(string password, string saltPassword)
        {
            string res = EncryptUtil.GenerateSHA256String(EncryptUtil.GenerateSHA256String(password) + saltPassword);
            return res;
        }
    }
}
