using AMWUtil.Common;
using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Entity
{
    public class ams_User : BaseEntitySTD
    {
        public string Password;
        public string SaltPassword;
        public string SecretKey;
        public string EmailAddress;
        public string LineToken;
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
