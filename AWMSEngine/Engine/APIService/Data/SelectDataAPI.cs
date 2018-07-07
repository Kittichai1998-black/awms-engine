using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.APIService.Data
{
    public class SelectDataAPI : BaseAPIService
    {
        protected override void ExecuteEngineManual()
        {
            new General.InsertSql().Execute(this.Logger, this.BuVO,
                new List<KeyGetSetCriteria>()
                {
                    new KeyGetSetCriteria (General.SelectSql.KEY_IN_Table,BusinessVOConst.KEY_REQUEST_FIELD("t")),
                    new KeyGetSetCriteria (General.SelectSql.KEY_IN_Where, BusinessVOConst.KEY_REQUEST_FIELD("q")),
                    new KeyGetSetCriteria (General.SelectSql.KEY_IN_Field,BusinessVOConst.KEY_REQUEST_FIELD("f")),
                    new KeyGetSetCriteria (General.SelectSql.KEY_IN_Group, BusinessVOConst.KEY_REQUEST_FIELD("g")),
                    new KeyGetSetCriteria (General.SelectSql.KEY_IN_Sort,BusinessVOConst.KEY_REQUEST_FIELD("s")),
                    new KeyGetSetCriteria (General.SelectSql.KEY_IN_Skip, BusinessVOConst.KEY_REQUEST_FIELD("sk")),
                    new KeyGetSetCriteria (General.SelectSql.KEY_IN_Limit,BusinessVOConst.KEY_REQUEST_FIELD("l")),
                    new KeyGetSetCriteria (General.SelectSql.KEY_IN_All, BusinessVOConst.KEY_REQUEST_FIELD("all"))
                },
                new List<KeyGetSetCriteria>()
                {
                    new KeyGetSetCriteria(General.SelectSql.KEY_OUT_Result,BusinessVOConst.KEY_TEMP_FIELD("result"))
                });

            new General.ListResponseObject().Execute(this.Logger, this.BuVO,
                new List<KeyGetSetCriteria>() {
                    new KeyGetSetCriteria(General.ListResponseObject.KEY_IN_BuVOKeyResponse,BusinessVOConst.KEY_TEMP_FIELD("result"))
                });
        }
    }
}
