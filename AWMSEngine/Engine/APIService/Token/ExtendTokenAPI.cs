using AWMSEngine.Engine.Validation;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.APIService.Token
{
    public class ExtendTokenAPI : BaseAPIService
    {
        protected override dynamic ExecuteEngineManual()
        {
            //new Validation.RemoveTokenRequestValidate().Execute(this.Logger, this.BuVO);

            var res1 = new General.ExtendToken().Execute(this.Logger, this.BuVO,
                new General.ExtendToken.TReqModel()
                {
                    Token = this.RequestVO.token,
                    ExtendKey = this.RequestVO.extendKey
                });

            return res1;
        }
    }
}
