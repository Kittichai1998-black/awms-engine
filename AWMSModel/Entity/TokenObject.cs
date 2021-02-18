using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Entity
{
    public class TokenObject
    {
        public string Token;
        public string ExtendKey;
        public int User_ID;
        public string User_Password;
        public int ClientSecret_ID;
        public string ClientSecret_SecretKey;
        public DateTime ExpireTime;
    }
}
