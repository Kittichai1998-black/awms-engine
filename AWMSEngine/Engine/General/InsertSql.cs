using AMWUtil.Logger;
using AWMSEngine.Common;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace AWMSEngine.Engine.General
{
    public class InsertSql : BaseEngine
    {
        public const string KEY_IN_Ins = "Insert";
        public const string KEY_IN_Con = "Condition";
        public const string KEY_OUT_Result = "Status";

        [EngineParamAttr(EngineParamAttr.InOutType.Request, KEY_IN_Ins, "Insert Data")]
        public RefVO<dynamic> InsertData { get; set; }
        [EngineParamAttr(EngineParamAttr.InOutType.Request, KEY_IN_Con, "Condition Data")]
        public RefVO<string> ConditionData { get; set; }

        [EngineParamAttr(EngineParamAttr.InOutType.Response, KEY_OUT_Result, "Return Status")]
        public RefVO<Dictionary<string, dynamic>> OutResult { get; set; }

        protected override void ExecuteEngine()
        {
            var tokenModel = 0;
            var get_bu = this.BuVO.Get<dynamic>("_REQUEST");
            var get_table = get_bu.t.ToString();
            var get_jins = JsonConvert.SerializeObject(InsertData.Value);
            var get_condition = ConditionData.Value;
            var get_revision = Convert.ToBoolean(get_bu.nr);
            List<Dictionary<string, dynamic>> get_ins = JsonConvert.DeserializeObject<List<Dictionary<string, dynamic>>>(get_jins);

            tokenModel = ADO.DataADO.GetInstant().InsUpd(
                    get_table,
                    get_ins,
                    get_condition,
                    get_revision,
                    this.Logger);

            if (tokenModel != 0)
            {
                Dictionary<string, dynamic> list = new Dictionary<string, dynamic>();
                list.Add(get_bu.datas.Path.ToString(), get_bu.datas);
                this.OutResult.Value = list;
            }
        }
    }
}
