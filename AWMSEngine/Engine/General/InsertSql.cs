using AMWUtil.Logger;
using AWMSEngine.Common;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.General
{
    public class InsertSql : BaseEngine
    {
        public const string KEY_OUT_Status = "Status";

        [EngineParamAttr(EngineParamAttr.InOutType.Response, KEY_OUT_Status, "Return Status")]
        public RefVO<int> OutStatus { get; set; }

        protected override void ExecuteEngine()
        {
            var get_bu = this.BuVO.Get<dynamic>("_REQUEST");
            var get_table = get_bu.t;
            var get_ins = get_bu.datas;
            var get_condition = get_bu.pk;

            if (get_condition == null)
            {
                var tokenModel = ADO.InsUpd.GetInstant().Insert(
                    get_table,
                    get_ins,
                    this.Logger);

                this.OutStatus.Value = tokenModel;
            }
            else
            {
                var tokenModel = ADO.InsUpd.GetInstant().Update(
                    get_table,
                    get_ins,
                    get_condition,
                    this.Logger);

                this.OutStatus.Value = tokenModel;
            }
        }
    }
}
