﻿using AMWUtil.Logger;
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
    public class InsertSql : BaseEngine<InsertSql.TReqModel, Dictionary<string,dynamic>>
    {
        public class TReqModel
        {
            public string t;
            public string pk;
            public string nr;
            public dynamic datas;
        }

        protected override Dictionary<string, dynamic> ExecuteEngine(InsertSql.TReqModel reqVO)
        {
            var tokenModel = 0;
            var get_table = reqVO.t.ToString();
            var get_jins = JsonConvert.SerializeObject(reqVO.datas);
            var get_condition = reqVO.pk.ToString();
            var get_revision = Convert.ToBoolean(reqVO.nr);
            List<Dictionary<string, dynamic>> get_ins = JsonConvert.DeserializeObject<List<Dictionary<string, dynamic>>>(get_jins);

            tokenModel = ADO.DataADO.GetInstant().InsUpd(
                    get_table,
                    get_ins,
                    get_condition,
                    get_revision,
                    this.BuVO);


            if (tokenModel != 0)
            {
                Dictionary<string, dynamic> list = new Dictionary<string, dynamic>();
                list.Add(reqVO.datas.Path.ToString(), reqVO.datas);
                return list;
            }
            return null;
        }
        
    }
}
