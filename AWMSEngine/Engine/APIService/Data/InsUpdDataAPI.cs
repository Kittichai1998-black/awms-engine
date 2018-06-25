using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
using AWMSEngine.Common;

namespace AWMSEngine.Engine.APIService.Data
{
    public class InsUpdDataAPI : BaseAPIService
    {
        protected override void ExecuteEngineManual()
        {
            new General.RegisterToken().Execute(this.Logger, this.BuVO,
                new List<KeyGetSetCriteria>()
                {
                    new KeyGetSetCriteria(General.RegisterToken.KEY_IN_Username,BusinessVOConst.KEY_REQUEST_FIELD("username")),
                    new KeyGetSetCriteria(General.RegisterToken.KEY_IN_Password,BusinessVOConst.KEY_REQUEST_FIELD("password")),
                    new KeyGetSetCriteria(General.RegisterToken.KEY_IN_SecretKey,BusinessVOConst.KEY_REQUEST_FIELD("secretKey")),
                },
                new List<KeyGetSetCriteria>()
                {
                    new KeyGetSetCriteria(General.RegisterToken.KEY_OUT_TokenInfo,BusinessVOConst.KEY_TEMP_FIELD("tokenInfo"))
                });

            new General.ResponseObject().Execute(this.Logger, this.BuVO,
                new List<KeyGetSetCriteria>() {
                    new KeyGetSetCriteria(General.ResponseObject.KEY_IN_BuVOKeyResponse,BusinessVOConst.KEY_TEMP_FIELD("tokenInfo"))
                });
        }
    }
}
