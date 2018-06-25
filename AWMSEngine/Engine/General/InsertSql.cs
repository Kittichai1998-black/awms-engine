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
        public const string KEY_OUT_Status = "Status";

        [EngineParamAttr(EngineParamAttr.InOutType.Response, KEY_OUT_Status, "Return Status")]
        public RefVO<int> OutStatus { get; set; }

        protected override void ExecuteEngine()
        {
            var get_bu = this.BuVO.Get<dynamic>("_REQUEST");
            var get_table = get_bu.t.ToString();
            var get_jins = JsonConvert.SerializeObject(get_bu.datas);
            var get_jcondition = JsonConvert.SerializeObject(get_bu.pk);
            List<Dictionary<string, dynamic>> get_ins = JsonConvert.DeserializeObject<List<Dictionary<string, dynamic>>>(get_jins);
            List<Dictionary<string, dynamic>> get_condition = JsonConvert.DeserializeObject<List<Dictionary<string, dynamic>>>(get_jcondition);

            if (get_condition == null)
            {
                var tokenModel = ADO.InsUpdADO.GetInstant().Insert(
                    get_table,
                    get_ins,
                    this.Logger);

                this.OutStatus.Value = tokenModel;
            }
            else
            {
                var tokenModel = ADO.InsUpdADO.GetInstant().Update(
                    get_table,
                    get_ins,
                    get_condition,
                    this.Logger);

                this.OutStatus.Value = tokenModel;
            }
        }
    }
}
