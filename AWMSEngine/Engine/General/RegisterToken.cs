using AWMSEngine.Common;
using AWMSModel.Constant.StringConst;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.General
{
    public class RegisterToken : BaseEngine<RegisterToken.TReqModel, amt_Token>
    {
        public class TReqModel
        {
            public string Username;
            public string Password;
            public string SecretKey;
        }


        protected override amt_Token ExecuteEngine(RegisterToken.TReqModel reqVO)
        {
            amt_Token tokenModel = ADO.TokenADO.GetInstant().Register(
                reqVO.Username,
                reqVO.Password,
                reqVO.SecretKey, 
                0,
                this.Logger);
            return tokenModel;

        }
    }
}
