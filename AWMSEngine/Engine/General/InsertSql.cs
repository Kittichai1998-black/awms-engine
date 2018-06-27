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
        public RefVO<Dictionary<string, dynamic>> InsertData { get; set; }
        [EngineParamAttr(EngineParamAttr.InOutType.Request, KEY_IN_Con, "Condition Data")]
        public RefVO<Dictionary<string, dynamic>> ConditionData { get; set; }

        [EngineParamAttr(EngineParamAttr.InOutType.Response, KEY_OUT_Result, "Return Status")]
        public RefVO<Dictionary<string,dynamic>> OutResult { get; set; }

        protected override void ExecuteEngine()
        {
            var tokenModel = 0;
            var get_bu = this.BuVO.Get<dynamic>("_REQUEST");
            var get_table = get_bu.t.ToString();
            var get_jins = JsonConvert.SerializeObject(get_bu.datas);
            var get_condition = get_bu.pk.ToString();
            var get_ins = JsonConvert.DeserializeObject<Dictionary<string, dynamic>>(get_jins);

            if (get_ins[get_condition] == null ?? "")
            {
                    tokenModel = ADO.InsUpdADO.GetInstant().Insert(
                    get_table,
                    get_ins,
                    get_condition,
                    this.Logger);
            }
            else
            {
                    tokenModel = ADO.InsUpdADO.GetInstant().Update(
                    get_table,
                    get_ins,
                    get_condition,
                    this.Logger);
            }
            if (tokenModel != 0)
            {
                this.OutResult.Value = get_ins;
            }
        }
    }
}
