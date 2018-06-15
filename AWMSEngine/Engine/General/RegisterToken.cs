using AWMSEngine.Common;
using AWMSModel.Constant.StringConst;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.General
{
    public class RegisterToken : BaseEngine
    {
        public const string KEY_IN_Username = "Username";
        public const string KEY_IN_Password = "Psername";
        public const string KEY_IN_SecretKey = "SecretKey";
        public const string KEY_OUT_TokenInfo = "TokenInfo";

        [EngineParamAttr(EngineParamAttr.InOutType.Request, KEY_IN_Username, "Authen Username")]
        public RefVO<string> InUsername { get; set; }
        [EngineParamAttr(EngineParamAttr.InOutType.Request, KEY_IN_Password, "Authen Password")]
        public RefVO<string> InPassword { get; set; }
        [EngineParamAttr(EngineParamAttr.InOutType.Request, KEY_IN_SecretKey, "Authen SecretKey")]
        public RefVO<string> InSecretKey { get; set; }

        [EngineParamAttr(EngineParamAttr.InOutType.Response, KEY_OUT_TokenInfo, "Result Token INFO")]
        public RefVO<amt_Token> OutTokenInfo { get; set; }

        protected override void ExecuteEngine()
        {
            var tokenModel = ADO.TokenADO.GetInstant().Register(
                this.InUsername.Value,
                this.InPassword.Value,
                this.InSecretKey.Value, 
                0,
                this.Logger);
            this.OutTokenInfo.Value = tokenModel;

        }
    }
}
