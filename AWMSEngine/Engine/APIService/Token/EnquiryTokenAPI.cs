using AWMSEngine.Engine.General;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.APIService.Token
{
    public class EnquiryTokenAPI : BaseAPIService
    {
        protected override void ExecuteEngineManual()
        {
            //new Validation.EnquiryTokenRequestValidate().Execute(this.Logger, this.BuVO);
            new General.EnquiryToken().Execute(this.Logger, this.BuVO,
                new List<KeyGetSetCriteria>() {
                    new KeyGetSetCriteria (General.EnquiryToken.KEY_IN_Token,BusinessVOConst.KEY_REQUEST_FIELD("token"))
                },
                new List<KeyGetSetCriteria>() {
                    new KeyGetSetCriteria (General.EnquiryToken.KEY_OUT_TokenInfo, BusinessVOConst.KEY_TEMP_FIELD("tokenInfo"))
                });

            new General.ResponseObject().Execute(this.Logger, this.BuVO,
                new List<KeyGetSetCriteria>() {
                    new KeyGetSetCriteria(General.ResponseObject.KEY_IN_BuVOKeyResponse,BusinessVOConst.KEY_TEMP_FIELD("tokenInfo"))
                });
        }
    }
}
