using AWMSEngine.Common;
using AMSModel.Constant.StringConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.General
{
    public class RemoveToken : BaseEngine<RemoveToken.TReqModel, amt_Token_status>
    {
        public class TReqModel
        {
            public string Token;
            public string SecretKey;
        }

        protected override amt_Token_status ExecuteEngine(RemoveToken.TReqModel reqVO)
        {
            var tokenModel = ADO.WMSDB.TokenADO.GetInstant().Remove(
                reqVO.Token,
                reqVO.SecretKey,
                0,
                this.BuVO);

            return tokenModel;
        }
    }
}
