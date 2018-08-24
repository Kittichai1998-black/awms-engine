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
        public int InsUpd(string table_name, Dictionary<string, dynamic> recv, string con, bool isNextRevision,
            VOCriteria buVO)
        {
            var recvList = new List<Dictionary<string, dynamic>>();
            recvList.Add(recv);
            return InsUpd(table_name, recvList, con, isNextRevision, buVO);
        }
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
                condition = con + " = @_condition and status != 2";
                var param = new Dapper.DynamicParameters();
                param.Add("@_condition", row[con]);
                param.Add("@actionBy", buVO.ActionBy);

                foreach (var data in row.SkipWhile(pk => pk.Key == con))
                {
                    param.Add("@" + data.Key.ToString(), data.Value);
                }

                if (revision == true)
                {
                    insupd = string.Format("update {0} set [Status] = 2,ModifyBy=@actionBy,ModifyTime=getdate() where {1}; select max(revision) from {0} where {2};",
                        table_name,
                        condition,
                        con + " = @_condition ");

                    int nextRevision = this.ExecuteScalar<int>(insupd,
                                    CommandType.Text, param, buVO.Logger, buVO.SqlTransaction) + 1;

                    insupd = string.Format("insert into {0} ({1}, revision,CreateBy,CreateTime) values ({2},{3},@actionBy,getdate())",
                        table_name,
                        columns.Substring(2),
                        "@" + parameter.Substring(3),
                        nextRevision);

                    res = this.Execute(insupd,
                                    CommandType.Text, param, buVO.Logger, buVO.SqlTransaction) + res;
                }
                else
                {
                    bool isInsert =
                        (row[con] == null ?? "")
                        ||
                        this.ExecuteScalar<int>(
                        string.Format("select top 1 1 from {0} where {1};",
                            table_name,
                            condition), CommandType.Text, param, buVO.Logger, buVO.SqlTransaction) != 1;
                    if (isInsert)
                    {
                        insupd = string.Format("insert into {0} ({1},CreateBy,CreateTime) values ({2},@actionBy,getdate())",
                            table_name,
                            columns.Substring(2),
                            "@" + parameter.Substring(3));
                    }
                    else
                    {
                        insupd = string.Format("update {0} set {1},ModifyBy=@actionBy,ModifyTime=getdate() where {2}",
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

        public T SelectByID<T>(object value, VOCriteria buVO)
             where T : IEntityModel
        {
            return SelectBy<T>(
                new SQLConditionCriteria[] { new SQLConditionCriteria("ID", value, SQLOperatorType.EQUALS) },
                new SQLOrderByCriteria[] { },
                null,
                null,
                buVO)
                .FirstOrDefault();
        }
        public T SelectByCodeActive<T>(object value, VOCriteria buVO)
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
                buVO).FirstOrDefault();
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
        public List<T> SelectBy<T>(KeyValuePair<string,object>[] wheres, VOCriteria buVO)
             where T : IEntityModel
        {
            return SelectBy<T>(
                wheres.Select(x => new SQLConditionCriteria(x.Key, x.Value, SQLOperatorType.EQUALS)).ToArray(),
                new SQLOrderByCriteria[] { },
                null,
                null,
                buVO);
        }
        public List<T> SelectBy<T>(SQLConditionCriteria[] wheres, SQLOrderByCriteria[] orderBys, int? limit, int? skip, VOCriteria buVO)
            where T : IEntityModel
        {
            return SelectBy<T>(null, "*", null, wheres, orderBys, limit, skip, buVO);
        }
        public List<T> SelectBy<T>(string table, string select, string groupBys, SQLConditionCriteria[] wheres, SQLOrderByCriteria[] orderBys, int? limit, int? skip, VOCriteria buVO)

        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            string commWhere = string.Empty;
            string commOrderBy = string.Empty;
            
            foreach (var w in wheres)
            {
                commWhere += string.Format("{3} {0} {1} {2} ",
                                        w.field,
                                        w.operatorType.Attribute<ValueAttribute>().Value,
                                        w.operatorType == SQLOperatorType.ISNULL || w.operatorType == SQLOperatorType.ISNOTNULL?"": "@" + w.field,
                                        w.conditionLeft != SQLConditionType.NONE && !string.IsNullOrEmpty(commWhere) ? w.conditionLeft.Attribute<ValueAttribute>().Value :
                                            string.IsNullOrEmpty(commWhere) ? string.Empty : "AND");

                object v = null;
                if (w.value == null) v = null;
                else if (w.value is string && w.operatorType == SQLOperatorType.LIKE) v = w.value.ToString().Replace('*', '%');
                else v = w.value;
                param.Add(w.field, v);
            }
            foreach (var o in orderBys)
            {
                commOrderBy += string.Format("{2}{0} {1}",
                                        o.field,
                                        o.orderBy.Attribute<ValueAttribute>().Value,
                                        string.IsNullOrEmpty(commOrderBy) ? string.Empty : ",");
            }
            string commTxt = string.Empty;
            if (skip.HasValue)
            {
                commTxt = string.Format(@"select {4} * from (select {5} from {0} {1} {6} {2} {3} ) x",
                        table ?? typeof(T).Name.Split('.').Last(),
                        string.IsNullOrEmpty(commWhere) ? string.Empty : "WHERE " + commWhere,
                        string.IsNullOrEmpty(commOrderBy) ? string.Empty : "ORDER BY " + commOrderBy,
                        skip.HasValue ? "OFFSET " + skip.Value + " ROWS" : string.Empty,
                        limit.HasValue ? "TOP " + limit.Value : string.Empty,
                        select,
                        string.IsNullOrEmpty(groupBys) ? string.Empty : " GROUP BY " + groupBys);
            }
            else
            {
                commTxt = string.Format(@"select {4} {5} from {0} {1} {6} {2} {3}",
                        table ?? typeof(T).Name.Split('.').Last(),
                        string.IsNullOrEmpty(commWhere) ? string.Empty : "WHERE " + commWhere,
                        string.IsNullOrEmpty(commOrderBy) ? string.Empty : "ORDER BY " + commOrderBy,
                        string.Empty,//skip
                        limit.HasValue ? "TOP " + limit.Value : string.Empty,
                        select,
                        string.IsNullOrEmpty(groupBys) ? string.Empty : " GROUP BY " + groupBys);
            }
            var res = this.Query<T>(
                    commTxt,
                    CommandType.Text,
                    param,
                    buVO.Logger, buVO.SqlTransaction)
                    .ToList();
            return res;
        }

        public int UpdateByID<T>(int id, VOCriteria buVO, params KeyValuePair<string, object>[] values)
             where T : IEntityModel
        {
            return UpdateByID<T>((long)id, buVO, values);
        }
        public int UpdateByID<T>(long id, VOCriteria buVO, params KeyValuePair<string, object>[] values)
             where T : IEntityModel
        {
            string commSets = string.Empty;
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            foreach (var x in values.ToList())
            {
                if (x.Key.Equals("CreateBy", "CreateDate", "ModifyBy", "ModifyTime"))
                    continue;

                commSets +=
                    string.Format("{1}{0}=@{0}",
                        x.Key,
                        string.IsNullOrEmpty(commSets) ? string.Empty : ",");
                param.Add(x.Key, x.Value);
            }
            if (typeof(BaseEntityCreateModify).IsAssignableFrom(typeof(T)))
            {
                commSets += ",ModifyBy='@actionBy',ModifyTime=getdate()";
                param.Add("actionBy", buVO.ActionBy);
            }
            param.Add("id", id);

            var res = this.Execute(
                    string.Format("update {0} set {1} where id=@value",
                        typeof(T).Name.Split('.').Last(), commSets),
                    CommandType.Text,
                    param,
                    buVO.Logger, buVO.SqlTransaction);
            return res;
        }
        public long? Insert<T>(VOCriteria buVO, params KeyValuePair<string, object>[] values)
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
            if (typeof(BaseEntityCreateOnly).IsAssignableFrom(typeof(T)))
            {
                commFields = ",CreateBy,CreateTime";
                commVals += ",'@actionBy',getdate()";
                param.Add("actionBy", buVO.ActionBy);
            }

            var res = this.ExecuteScalar<long?>(
                    string.Format("insert into {0} ({1}) values ({2});SELECT SCOPE_IDENTITY();",
                        typeof(T).Name.Split('.').Last(), commFields, commVals),
                    CommandType.Text,
                    param,
                    buVO.Logger, buVO.SqlTransaction);

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
            foreach (var data in wheredata)
            {
                param.Add("@" + data.Key, data.Value);
            }





            string select = String.Format("select top {4} {0} from {1} where {2} group by {3} order by {5}",
                fielddata, tabledata, get_where, groupdata, limitdata, get_sort);




            return null;
        }

        public long NextNum(string key, bool prefixYM, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("key", key);
            param.Add("prefixYM", prefixYM);
            param.Add("res", null, DbType.Int64, ParameterDirection.Output);

            this.Execute("SP_NEXTNUM", CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction);

            long res = param.Get<long>("res");
            return res;
        }
        public string NextTextNum(string key, bool prefixYM, int space, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("key", key);
            param.Add("numZ", false);
            param.Add("prefixYM", prefixYM);
            param.Add("numspace", space);
            param.Add("res", null, DbType.String, ParameterDirection.Output);

            this.Execute("SP_NEXTNUM_TEXT", CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction);

            string res = param.Get<string>("res");
            return res;
        }
        public string NextTextZ(string key, bool prefixYM, int space, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("key", key);
            param.Add("numZ", true);
            param.Add("prefixYM", prefixYM);
            param.Add("numspace", space);
            param.Add("res", null, DbType.String, ParameterDirection.Output);

            this.Execute("SP_NEXTNUM_TEXT", CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction);

            string res = param.Get<string>("res");
            return res;
        }
    }
}
