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
    public class EnquiryToken : BaseEngine<EnquiryToken.TReqModle, amt_Token_status>
    {
        public class TReqModle
        {
            public string Token;
            public string SecretKey;
        }

        protected override amt_Token_status ExecuteEngine(EnquiryToken.TReqModle resVO)
        {
            amt_Token_status tokenModel = ADO.TokenADO.GetInstant().Enquiry(
                resVO.Token, this.BuVO);
            return tokenModel;
        }
    }
}
