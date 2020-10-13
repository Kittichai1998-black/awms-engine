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
using AWMSModel.Criteria;

namespace AWMSEngine.Engine.V2.General
{
    public class InsertSql : BaseEngine<InsertSql.TReqModel, NullCriteria>
    {
        public class TReqModel
        {
            public string t;
            public string pk;
            public string nr;
            public dynamic datas;
        }
        

        protected override NullCriteria ExecuteEngine(InsertSql.TReqModel reqVO)
        {
            var tokenModel = 0;
            var get_table = reqVO.t.ToString();
            var get_jins = JsonConvert.SerializeObject(reqVO.datas);
            var get_condition = reqVO.pk.ToString();
            var get_revision = Convert.ToBoolean(reqVO.nr);
            List<Dictionary<string, dynamic>> get_ins = JsonConvert.DeserializeObject<List<Dictionary<string, dynamic>>>(get_jins);

            tokenModel = ADO.WMSDB.DataADO.GetInstant().InsUpd(
                    get_table,
                    get_ins,
                    get_condition,
                    get_revision,
                    this.BuVO);

            
            return null;
        }
        
    }
}
