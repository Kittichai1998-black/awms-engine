using AWMSModel.Constant.EnumConst;
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

    public class amt_Token_status
    {
        public string token;
        public EntityStatus Status;
    }

    public class amt_Token_ext
    {
        public string token;
        public string extendKey;
    }
}
