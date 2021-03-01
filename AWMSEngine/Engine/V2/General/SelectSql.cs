using AMWUtil.Logger;
using AWMSEngine.Common;
using AMSModel.Entity;
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
using AMSModel.Criteria;
using AMWUtil.Exception;

namespace AWMSEngine.Engine.V2.General
{
    public class SelectSql : BaseEngine<SelectSql.TReqModel, SelectSql.TResModel>
    {
        public class TReqModel
        {
            public string table_prefix;
            public string t;//table
            public string q;//where query
            public string f;//select field
            public string g;//group
            public string s;//sort
            public string sk;//skip
            public string l;//limit
            public string ft;
            public bool? isCounts;//display count
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
                dynamic q = JsonConvert.DeserializeObject<dynamic>(reqVO.q);
                whares = GenerateWheres(q);
                List<SQLConditionCriteria> GenerateWheres(dynamic q)
                {
                    if (q == null) return null;
                    List<SQLConditionCriteria> res = new List<SQLConditionCriteria>();
                    foreach (var _q in q)
                    {
                        List<SQLConditionCriteria> whereGroups = GenerateWheres(_q.q);
                        SQLConditionCriteria w = (whereGroups != null && whereGroups.Count()>0) ?
                            new SQLConditionCriteria(whereGroups, (string)_q.o) :
                            new SQLConditionCriteria((string)_q.f, (string)_q.v, (string)_q.c, (string)_q.o);
                        res.Add(w);
                    }
                    return res;
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
                var datas = ADO.WMSDB.DataADO.GetInstant().SelectBy<dynamic>(reqVO.table_prefix + tb, reqVO.f, reqVO.g, whares.ToArray(), orders.ToArray(), reqVO.l.Get2Try<int>(), reqVO.sk.Get2Try<int>(), this.BuVO);
                TResModel res = new TResModel();
                res.datas = datas;
                if(reqVO.isCounts.HasValue && reqVO.isCounts.Value)
                {
                    var dataCount = ADO.WMSDB.DataADO.GetInstant().SelectBy<dynamic>(reqVO.table_prefix + tb, "count(1) c", reqVO.g, whares.ToArray(), null, null, null, this.BuVO).First();
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
