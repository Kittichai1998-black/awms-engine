using AWMSEngine.Common;
using AWMSModel.Constant.StringConst;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.General
{
    public class RemoveToken : BaseEngine
    {
        public const string KEY_IN_Token = "Token";
        public const string KEY_IN_SecretKey = "SecretKey";
        public const string KEY_OUT_Status = "Status";

        [EngineParamAttr(EngineParamAttr.InOutType.Request, KEY_IN_Token, "Authen Token")]
        public RefVO<string> InTokenInfo { get; set; }
        [EngineParamAttr(EngineParamAttr.InOutType.Request, KEY_IN_SecretKey, "Authen SecretKey")]
        public RefVO<string> InSecretKey { get; set; }

        [EngineParamAttr(EngineParamAttr.InOutType.Response, KEY_OUT_Status, "Return Status")]
        public RefVO<amt_Token_status> OutStatus { get; set; }

        protected override void ExecuteEngine()
        {
            var tokenModel = ADO.TokenADO.GetInstant().Remove(
                this.InTokenInfo.Value,
                this.InSecretKey.Value, 
                0,
                this.Logger);

            this.OutStatus.Value = tokenModel;
        }
    }
}
