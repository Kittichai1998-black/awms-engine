using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
using AWMSEngine.Common;

namespace AWMSEngine.Engine.APIService.UI
{
    public class ListMenuAPI : BaseAPIService
    {
        protected override void ExecuteEngineManual()
        {
            new General.ListMenu().Execute(this.Logger, this.BuVO,
                new List<KeyGetSetCriteria>()
                {
                    new KeyGetSetCriteria (General.ListMenu.KEY_IN_Token,BusinessVOConst.KEY_REQUEST_FIELD("token")),
                },
                new List<KeyGetSetCriteria>()
                {
                    new KeyGetSetCriteria(General.ListMenu.KEY_OUT_Result,BusinessVOConst.KEY_TEMP_FIELD("result"))
                });

            new General.MenuResponseObject().Execute(this.Logger, this.BuVO,
                new List<KeyGetSetCriteria>() {
                    new KeyGetSetCriteria(General.MenuResponseObject.KEY_IN_BuVOKeyResponse,BusinessVOConst.KEY_TEMP_FIELD("result"))
                });
        }
    }
}
