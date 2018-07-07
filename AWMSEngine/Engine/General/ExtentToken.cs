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
    public class ExtendToken : BaseEngine<ExtendToken.TReqModel,amt_Token_ext>
    {
        public class TReqModel
        {
            public string Token;
            public string ExtendKey;
        }

        protected override amt_Token_ext ExecuteEngine(TReqModel reqVO)
        {
            var tokenModel = ADO.TokenADO.GetInstant().Extend(
                reqVO.Token,
                reqVO.ExtendKey,
                0,
                this.Logger);

            return tokenModel;
        }
    }
}
