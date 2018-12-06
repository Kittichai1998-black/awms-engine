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
using AMWUtil.Exception;

namespace AWMSEngine.Engine.General
{
    public class SelectSql : BaseEngine<SelectSql.TReqModel, SelectSql.TResModel>
    {
        public class TReqModel
        {
            public string table_prefix;
            public string t;
            public string q;
            public string f;
            public string g;
            public string s;
            public string sk;
            public string l;
            public string ft;
            public bool isCounts;
        }
        public class TResModel
        {
            public List<dynamic> datas;
            public int? counts;
        }

        protected override TResModel ExecuteEngine(TReqModel reqVO)
        {
            List<SQLConditionCriteria> whares = new List<SQLConditionCriteria>();
            if(reqVO.q != null)
            {
                dynamic get_where = JsonConvert.DeserializeObject<dynamic>(reqVO.q);
                foreach (var q in get_where)
                {
                    SQLConditionCriteria w = new SQLConditionCriteria((string)q.f, (string)q.v, (string)q.c, (string)q.o);
                    whares.Add(w);
                }
            }

            List<SQLOrderByCriteria> orders = new List<SQLOrderByCriteria>();
            if (reqVO.s != null)
            {
                dynamic get_sort = JsonConvert.DeserializeObject<dynamic>(reqVO.s);
                foreach (var s in get_sort)
                {
                    SQLOrderByCriteria o = new SQLOrderByCriteria((string)s.f, (string)s.od);
                    orders.Add(o);
                }
            }

            if(reqVO.sk != null && reqVO.s == null)
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "การใช้ skip ต้องส่ง field sort มาด้วย");
            }
            
            TResModel Query(string tb)
            {
                var datas = ADO.DataADO.GetInstant().SelectBy<dynamic>(reqVO.table_prefix + tb, reqVO.f, reqVO.g, whares.ToArray(), orders.ToArray(), reqVO.l.GetTry<int>(), reqVO.sk.GetTry<int>(), this.BuVO);
                TResModel res = new TResModel();
                res.datas = datas;
                if(reqVO.isCounts)
                {
                    var dataCount = ADO.DataADO.GetInstant().SelectBy<dynamic>(reqVO.table_prefix + tb, "count(1) c", reqVO.g, whares.ToArray(), orders.ToArray(), null, null, this.BuVO).First();
                    res.counts = (int)dataCount.c;
                }

                return res;
            }

            var res2 = Query(reqVO.t);
            if(!string.IsNullOrEmpty(reqVO.ft))
                res2.datas.Insert(0, new { ID = "", Code = reqVO.ft, Name = reqVO.ft });
            return res2;

        }
    }
}
