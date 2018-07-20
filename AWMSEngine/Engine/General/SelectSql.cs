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
using System.Dynamic;
using AMWUtil.Common;
using AWMSModel.Criteria;

namespace AWMSEngine.Engine.General
{
    public class SelectSql : BaseEngine<SelectSql.TReqModel, SelectSql.TResModel>
    {
        public class TReqModel
        {
            public string t;
            public string q;
            public string f;
            public string g;
            public string s;
            public string sk;
            public string l;
            public string all;
        }
        public class TResModel
        {
            public List<dynamic> datas;
        }

        protected override TResModel ExecuteEngine(TReqModel reqVO)
        {
            dynamic get_where = JsonConvert.DeserializeObject<dynamic>(reqVO.q);
            List<SQLConditionCriteria> whares = new List<SQLConditionCriteria>();
            foreach (var q in get_where)
            {
                SQLConditionCriteria w = new SQLConditionCriteria((string)q.f, (string)q.v, (string)q.c, (string)q.o);
                whares.Add(w);
            }

            dynamic get_sort = JsonConvert.DeserializeObject<dynamic>(reqVO.s);
            List<SQLOrderByCriteria> orders = new List<SQLOrderByCriteria>();
            foreach (var s in get_sort)
            {
                SQLOrderByCriteria o = new SQLOrderByCriteria((string)s.f, (string)s.od);
                orders.Add(o);
            }


            if (reqVO.t.ToLower().Equals("skumaster"))
                return Query("ams_SKUMaster");
            if (reqVO.t.ToLower().Equals("packmaster"))
                return Query("ams_PackMaster");
            if (reqVO.t.ToLower().Equals("basemaster"))
                return Query("ams_BaseMaster");

            TResModel Query(string tb)
            {
                var datas = ADO.DataADO.GetInstant().SelectBy<dynamic>(tb, reqVO.f, whares.ToArray(), orders.ToArray(), reqVO.l.GetTry<int>(), reqVO.sk.GetTry<int>(), this.BuVO);
                TResModel res = new TResModel();
                res.datas = datas;
                return res;
            }

            return null;
        }
    }
}
