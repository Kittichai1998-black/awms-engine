using AWMSEngine.Common;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.General
{
    public class EnquiryToken : BaseEngine
    {
        public const string KEY_IN_Token = "Token";
        public const string KEY_IN_SecretKey = "SecretKey";
        public const string KEY_OUT_TokenInfo = "TokenInfo";

        [EngineParamAttr(EngineParamAttr.InOutType.Request, KEY_IN_Token, "Token")]
        public RefVO<string> InToken { get; set; }
        [EngineParamAttr(EngineParamAttr.InOutType.Request, KEY_IN_SecretKey, "Authen SecretKey")]
        public RefVO<string> InSecretKey { get; set; }

        [EngineParamAttr(EngineParamAttr.InOutType.Response, KEY_OUT_TokenInfo, "Result Token INFO")]
        public RefVO<amt_Token_status> OutTokenInfo { get; set; }

        protected override void ExecuteEngine()
        {
            var tokenModel = ADO.TokenADO.GetInstant().Enquiry(
                this.InToken.Value,
                this.InSecretKey.Value,
                this.Logger);
            this.OutTokenInfo.Value = tokenModel;

        }
    }
}
