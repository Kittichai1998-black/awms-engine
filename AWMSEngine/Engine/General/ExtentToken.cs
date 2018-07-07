using AWMSEngine.Common;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.General
{
    public class ExtendToken : BaseEngine
    {
        public const string KEY_IN_Token = "Token";
        public const string KEY_IN_ExtendKey = "ExtendKey";
        public const string KEY_OUT_Result = "Result";

        [EngineParamAttr(EngineParamAttr.InOutType.Request, KEY_IN_Token, "Authen Token")]
        public RefVO<string> InTokenInfo { get; set; }
        [EngineParamAttr(EngineParamAttr.InOutType.Request, KEY_IN_ExtendKey, "Authen ExtendKey")]
        public RefVO<string> InExtendKey { get; set; }

        [EngineParamAttr(EngineParamAttr.InOutType.Response, KEY_OUT_Result, "Return Result")]
        public RefVO<amt_Token_ext> OutResult { get; set; }

        protected override void ExecuteEngine()
        {
            var tokenModel = ADO.TokenADO.GetInstant().Extend(
                this.InTokenInfo.Value,
                this.InExtendKey.Value,
                0,
                this.Logger);

            this.OutResult.Value = tokenModel;
        }
    }
}
