using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public class amt_Token : BaseEntityCreateModify
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
