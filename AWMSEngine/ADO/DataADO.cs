using AMWUtil.Logger;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSModel.Criteria.Attribute;
using AWMSModel.Constant.EnumConst;

namespace AWMSEngine.ADO
{
    public class DataADO : BaseMSSQLAccess<DataADO>
    {
        public int InsUpd(string table_name, List<Dictionary<string, dynamic>> recvlist, string con, bool revision,
            VOCriteria buVO)
        {
            Dictionary<string, dynamic> selectlist = new Dictionary<string, dynamic>();

            string columns = "";
            string parameter = "";
            string update = "";
            string condition = "";
            string insupd = "";

            foreach (var row in recvlist)
            {
                foreach (var data in row)
                {
                    selectlist.Add(data.Key.ToString(), data.Value);
                }
                break;
            }

            foreach (var rowlist in selectlist.SkipWhile(pk => pk.Key == con))
            {
                columns = columns + ", " + rowlist.Key;
                parameter = parameter + ", @" + rowlist.Key;
                update = update + ", " + rowlist.Key + " = @" + rowlist.Key;
            }

            int res = 0;
            foreach (var row in recvlist)
            {
                condition = string.Format(con + " = {0}", row[con] ?? String.Empty);
                var param = new Dapper.DynamicParameters();
                foreach (var data in row.SkipWhile(pk => pk.Key == con))
                {
                    param.Add("@" + data.Key.ToString(), data.Value);
                }

                if (revision == true)
                {
                    insupd = string.Format("update {0} set {1} , [Status] = 2 where {2}",
                        table_name,
                        update.Substring(2),
                        condition);

                    this.Execute(insupd,
                                    CommandType.Text, param, buVO.Logger, buVO.SqlTransaction);

                    insupd = string.Format("insert into {0} ({1}) values ({2})",
                        table_name,
                        columns.Substring(2),
                        "@" + parameter.Substring(3));

                    res = this.Execute(insupd,
                                    CommandType.Text, param, buVO.Logger, buVO.SqlTransaction) + res;
                }
                else
                {
                    if (row[con] == null ?? "")
                    {
                        insupd = string.Format("insert into {0} ({1}) values ({2})",
                            table_name,
                            columns.Substring(2),
                            "@" + parameter.Substring(3));
                    }
                    else
                    {
                        insupd = string.Format("update {0} set {1} where {2}",
                            table_name,
                            update.Substring(2),
                            condition);
                    }

                    res = this.Execute(insupd,
                                    CommandType.Text, param, buVO.Logger, buVO.SqlTransaction) + res;
                }
            }
            return res;
        }

        public List<T> SelectByID<T>(object value, VOCriteria buVO)
             where T : IEntityModel
        {
            return SelectBy<T>(
                new SQLConditionCriteria[] { new SQLConditionCriteria("ID", value, SQLOperatorType.EQUALS) },
                new SQLOrderByCriteria[] { },
                null,
                null,
                buVO);
        }
        public List<T> SelectByCode<T>(object value, VOCriteria buVO)
             where T : IEntityModel
        {
            return SelectBy<T>(
                new SQLConditionCriteria[] {
                    new SQLConditionCriteria("Code", value, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Status",1, SQLOperatorType.EQUALS)
                },
                new SQLOrderByCriteria[] { },
                null,
                null,
                buVO);
        }
        public List<T> SelectBy<T>(string field, object value, VOCriteria buVO)
             where T : IEntityModel
        {
            return SelectBy<T>(
                new SQLConditionCriteria[] { new SQLConditionCriteria(field, value, SQLOperatorType.EQUALS) },
                new SQLOrderByCriteria[] { },
                null,
                null,
                buVO);
        }
        public List<T> SelectBy<T>(SQLConditionCriteria[] wheres, SQLOrderByCriteria[] orderBys,  int? limit, int? skip, VOCriteria buVO)
            where T : IEntityModel
        {
            return SelectBy<T>(null, "*", wheres, orderBys, limit, skip, buVO);
        }
        public List<T> SelectBy<T>(string table, string select, SQLConditionCriteria[] wheres, SQLOrderByCriteria[] orderBys, int? limit, int? skip, VOCriteria buVO)
        
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            string commWhere = string.Empty;
            string commOrderBy = string.Empty;

            foreach (var w in wheres)
            {
                commWhere += string.Format("{3} {0}{1}@{2}",
                                        w.field,
                                        w.operatorType.Attribute<ValueAttribute>().Value,
                                        w.field,
                                        w.conditionRight.HasValue ? w.conditionRight.Value.Attribute<ValueAttribute>().Value : string.Empty);
                param.Add(w.field, w.value);
            }
            foreach (var o in orderBys)
            {
                commOrderBy += string.Format("{2}{0} {1}",
                                        o.field,
                                        o.orderBy.Attribute<ValueAttribute>().Value,
                                        string.IsNullOrEmpty(commOrderBy) ? string.Empty : ",");
            }
            string commTxt = string.Format(@"select {4} * from (select {5} from {0} {1} {2} {3} ) x",
                        table ?? typeof(T).Name.Split('.').Last(),
                        string.IsNullOrEmpty(commWhere) ? string.Empty : "WHERE " + commWhere,
                        string.IsNullOrEmpty(commOrderBy) ? string.Empty : "ORDER BY " + commOrderBy,
                        skip.HasValue ? "OFFSET " + skip.Value + " ROWS" : string.Empty,
                        limit.HasValue ? "TOP " + limit.Value : string.Empty,
                        select);
            var res = this.Query<T>(
                    commTxt,
                    CommandType.Text,
                    param,
                    buVO.Logger, buVO.SqlTransaction)
                    .ToList();
            return res;
        }

        public List<T> UpdateByID<T>(int id, VOCriteria buVO, params KeyValuePair<string,object>[] values)
             where T : IEntityModel
        {
            string commSets = string.Empty;
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            foreach(var x in values.ToList())
            {
                if (x.Key.Equals("CreateBy", "CreateDate", "ModifyBy", "ModifyTime"))
                    continue;

                commSets +=
                    string.Format("{1}{0}=@{0}",
                        x.Key,
                        string.IsNullOrEmpty(commSets) ? string.Empty : ",");
                param.Add(x.Key, x.Value);
            }
            if (typeof(T) == typeof(BaseEntityCreateModify))
            {
                commSets += ",ModifyBy='@actionBy',ModifyTime=getdate()";
                param.Add("actionBy", buVO.ActionBy);
            }
            param.Add("id", id);

            var res = this.Query<T>(
                    string.Format("update {0} set {1} where id=@value",
                        typeof(T).Name.Split('.').Last(), commSets),
                    CommandType.Text,
                    param,
                    buVO.Logger, buVO.SqlTransaction)
                    .ToList();
            return res;
        }
        public List<T> Insert<T>(VOCriteria buVO, params KeyValuePair<string, object>[] values)
             where T : IEntityModel
        {
            string commFields = string.Empty;
            string commVals = string.Empty;
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            foreach (var x in values.ToList())
            {
                if (x.Key.Equals("CreateBy", "CreateDate", "ModifyBy", "ModifyTime"))
                    continue;

                commFields +=
                    string.Format("{0}{1}",
                        x.Key,
                        string.IsNullOrEmpty(commFields) ? string.Empty : ",");
                commVals +=
                    string.Format("@{0}{1}",
                        x.Key,
                        string.IsNullOrEmpty(commFields) ? string.Empty : ",");
                param.Add(x.Key, x.Value);
            };
            if (typeof(T) == typeof(BaseEntityCreateOnly))
            {
                commFields = ",CreateBy,CreateTime";
                commVals += ",'@actionBy',getdate()";
                param.Add("actionBy", buVO.ActionBy);
            }

            var res = this.Query<T>(
                    string.Format("insert into {0} ({1}) values ({2})",
                        typeof(T).Name.Split('.').Last(), commFields, commVals),
                    CommandType.Text,
                    param,
                    buVO.Logger, buVO.SqlTransaction)
                    .ToList();
            return res;
        }

        public Dictionary<string, dynamic> Select(string fielddata, string tabledata, 
            dynamic wheredata, string groupdata, dynamic sortdata, string skipdata,
            string limitdata, string alldata,
            VOCriteria buVO)
        {
            var get_where = "";
            var get_sort = "";

            var str_select = "";

            var param = new Dapper.DynamicParameters();
            foreach(var data in wheredata)
            {
                param.Add("@" + data.Key, data.Value);
            }





            string select = String.Format("select top {4} {0} from {1} where {2} group by {3} order by {5}",
                fielddata, tabledata, get_where, groupdata, limitdata, get_sort);




            return null;
        }
    }
}
