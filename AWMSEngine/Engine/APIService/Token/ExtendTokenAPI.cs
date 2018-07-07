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
        protected override void ExecuteEngineManual()
        {
            //new Validation.RemoveTokenRequestValidate().Execute(this.Logger, this.BuVO);

            new General.ExtendToken().Execute(this.Logger, this.BuVO,
                new List<KeyGetSetCriteria>()
                {
                    new KeyGetSetCriteria(General.ExtendToken.KEY_IN_Token,BusinessVOConst.KEY_REQUEST_FIELD("token")),
                    new KeyGetSetCriteria(General.ExtendToken.KEY_IN_ExtendKey,BusinessVOConst.KEY_REQUEST_FIELD("extendKey")),
                },
                new List<KeyGetSetCriteria>()
                {
                    new KeyGetSetCriteria(General.ExtendToken.KEY_OUT_Result,BusinessVOConst.KEY_TEMP_FIELD("status"))
                });

            new General.ResponseObject().Execute(this.Logger, this.BuVO,
                new List<KeyGetSetCriteria>() {
                    new KeyGetSetCriteria(General.ResponseObject.KEY_IN_BuVOKeyResponse,BusinessVOConst.KEY_TEMP_FIELD("status"))
                });
        }
    }
}
