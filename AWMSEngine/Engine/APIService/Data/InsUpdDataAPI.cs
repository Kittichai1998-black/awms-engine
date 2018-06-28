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
            new General.InsertSql().Execute(this.Logger, this.BuVO,
                new List<KeyGetSetCriteria>()
                {
                    new KeyGetSetCriteria (General.InsertSql.KEY_IN_Ins,BusinessVOConst.KEY_REQUEST_FIELD("datas")),
                    new KeyGetSetCriteria (General.InsertSql.KEY_IN_Con, BusinessVOConst.KEY_REQUEST_FIELD("pk"))
                },
                new List<KeyGetSetCriteria>()
                {
                    new KeyGetSetCriteria(General.InsertSql.KEY_OUT_Result,BusinessVOConst.KEY_TEMP_FIELD("result"))
                });

            new General.ListResponseObject().Execute(this.Logger, this.BuVO,
                new List<KeyGetSetCriteria>() {
                    new KeyGetSetCriteria(General.ListResponseObject.KEY_IN_BuVOKeyResponse,BusinessVOConst.KEY_TEMP_FIELD("result"))
                });
        }
    }
}
