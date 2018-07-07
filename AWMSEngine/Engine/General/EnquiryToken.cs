using AMWUtil.Exception;
using AWMSEngine.Common;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.General
{
    public class EnquiryToken : BaseEngine
    {
        public const string KEY_IN_Token = "Token";
        public const string KEY_OUT_TokenInfo = "TokenInfo";

        [EngineParamAttr(EngineParamAttr.InOutType.Request, KEY_IN_Token, "Token")]
        public RefVO<string> InToken { get; set; }

        [EngineParamAttr(EngineParamAttr.InOutType.Response, KEY_OUT_TokenInfo, "Result Token INFO")]
        public RefVO<amt_Token_status> OutTokenInfo { get; set; }

        protected override void ExecuteEngine()
        {
            var tokenModel = ADO.TokenADO.GetInstant().Enquiry(
                this.InToken.Value,
                this.Logger);
            this.OutTokenInfo.Value = tokenModel;
            if(this.OutTokenInfo.Value.Status.ToString() == "3")
            {
                dynamic result = new ExpandoObject();
                result.status = 0;
                result.code = AMWExceptionCode.S0000.ToString();
                result.message = "Time Out";
                this.BuVO.Set(BusinessVOConst.KEY_RESULT_API, result);
            }
        }
    }
}
