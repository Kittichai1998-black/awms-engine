using AWMSEngine.Engine.Validation;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.APIService.Token
{
    public class RemoveTokenAPI : BaseAPIService
    {
        protected override void ExecuteEngineManual()
        {
            new Validation.RemoveTokenRequestValidate().Execute(this.Logger, this.BuVO);

            new General.RemoveToken().Execute(this.Logger, this.BuVO,
                new List<KeyGetSetCriteria>()
                {
                    new KeyGetSetCriteria(General.RemoveToken.KEY_IN_Token,BusinessVOConst.KEY_REQUEST_FIELD("token")),
                    new KeyGetSetCriteria(General.RemoveToken.KEY_IN_SecretKey,BusinessVOConst.KEY_REQUEST_FIELD("secretKey")),
                },
                new List<KeyGetSetCriteria>()
                {
                    new KeyGetSetCriteria(General.RemoveToken.KEY_OUT_Status,BusinessVOConst.KEY_TEMP_FIELD("status"))
                });

            new General.ResponseObject().Execute(this.Logger, this.BuVO,
                new List<KeyGetSetCriteria>() {
                    new KeyGetSetCriteria(General.ResponseObject.KEY_IN_BuVOKeyResponse,BusinessVOConst.KEY_TEMP_FIELD("status"))
                });
        }
    }
}
