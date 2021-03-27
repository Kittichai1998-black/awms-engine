﻿using AMWUtil.Logger;
using AMSModel.Criteria;
using AMSModel.Entity;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AMSModel.Criteria.Attribute;
using AMSModel.Constant.EnumConst;
using System.Text.RegularExpressions;

namespace ADO.WCSDB
{
    public class DataADO : BaseWCSDB<DataADO>
    {
        public List<dynamic> QuerySP(string spname, Dapper.DynamicParameters parameters, VOCriteria buVO)
        {
            var res = this.Query<dynamic>(spname, CommandType.StoredProcedure, parameters, buVO == null ? null : buVO.Logger, buVO == null ? null : buVO.SqlTransaction).ToList();
            return res;
        }
        public List<T> QuerySP<T>(string spname, Dapper.DynamicParameters parameters, VOCriteria buVO)
        {
            var res = this.Query<T>(spname, CommandType.StoredProcedure, parameters, buVO == null ? null : buVO.Logger, buVO == null ? null : buVO.SqlTransaction).ToList();
            return res;
        }
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
                if (!string.IsNullOrEmpty(columns))
                    columns += ",";
                columns += rowlist.Key;

                string v = rowlist.Value == null ? null : rowlist.Value.ToString();
                if (v != null && v.StartsWith("API.INSERT.SQLCUSTOM"))
                {
                    if (!string.IsNullOrEmpty(parameter))
                        parameter += ",";
                    if (!string.IsNullOrEmpty(update))
                        update += ",";
                    parameter += CommandByConfig(v);
                    update += rowlist.Key + " = " + CommandByConfig(v);
                }
                else
                {
                    if (!string.IsNullOrEmpty(parameter))
                        parameter += ",";
                    if (!string.IsNullOrEmpty(update))
                        update += ",";
                    parameter += "@" + rowlist.Key;
                    update +=  rowlist.Key + " = @" + rowlist.Key;
                }
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
                    string v = data.Value == null ? null : data.Value.ToString();
                    if (v == null || !v.StartsWith("@@sql"))
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
                        columns,
                        parameter,
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
                            columns,
                            parameter);
                    }
                    else
                    {
                        insupd = string.Format("update {0} set {1},ModifyBy=@actionBy,ModifyTime=getdate() where {2}",
                            table_name,
                            update,
                            condition);
                    }

                    res = this.Execute(insupd,
                                    CommandType.Text, param, buVO.Logger, buVO.SqlTransaction) + res;
                }
            }
            return res;
        }


        public int CountBy<T>(SQLConditionCriteria[] wheres, VOCriteria buVO)
             where T : IEntityModel
        {
            var _count = SelectBy<dynamic>(
                typeof(T).Name.Split('.').Last(),
                "count(1) c",
                "",
                wheres,
                new SQLOrderByCriteria[] { },
                null,
                null,
                buVO).FirstOrDefault();
            if (_count == null) return 0;
            return (int)_count.c;
        }
        public decimal SumBy<T>(string field, SQLConditionCriteria[] wheres, VOCriteria buVO)
             where T : IEntityModel
        {
            var _count = SelectBy<dynamic>(
                typeof(T).Name.Split('.').Last(),
                "sum("+field+") c",
                "",
                wheres,
                new SQLOrderByCriteria[] { },
                null,
                null,
                buVO).FirstOrDefault();
            if (_count == null) return 0;
            return (decimal)_count.c;
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


        public List<T> ListByActive<T>(VOCriteria buVO)
             where T : IEntityModel
        {
            return SelectBy<T>(
                "Status",EntityStatus.ACTIVE,
                buVO);
        }
        public List<T> SelectBy<T>(ListKeyValue<string,object> keyValues, VOCriteria buVO)
             where T : IEntityModel
        {
            return SelectBy<T>(
                keyValues.ToArray(),
                buVO);
        }
        public List<T> SelectBy<T>(VOCriteria buVO)
             where T : IEntityModel
        {
            return SelectBy<T>(
                new SQLConditionCriteria[] { },
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
        public List<T> SelectBy<T>(KeyValuePair<string, object>[] wheres, VOCriteria buVO)
             where T : IEntityModel
        {
            return SelectBy<T>(
                wheres.Select(x => new SQLConditionCriteria(x.Key, x.Value, SQLOperatorType.EQUALS)).ToArray(),
                new SQLOrderByCriteria[] { },
                null,
                null,
                buVO);
        }
        public List<T> SelectBy<T>(string field, object value, SQLOperatorType op, VOCriteria buVO)
             where T : IEntityModel
        {
            return SelectBy<T>(
                new SQLConditionCriteria[] { new SQLConditionCriteria(field,value,op) },
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
        public List<T> SelectBy<T>(SQLConditionCriteria[] wheres, VOCriteria buVO)
            where T : IEntityModel
        {
            return SelectBy<T>(null, "*", null, wheres, new SQLOrderByCriteria[] { }, null, null, buVO);
        }
        public List<T> SelectBy<T>(SQLConditionCriteria where, VOCriteria buVO)
           where T : IEntityModel
        {
            return SelectBy<T>(null, "*", null, new SQLConditionCriteria[] { where },  new SQLOrderByCriteria[] { }, null, null, buVO);
        }
        public List<T> SelectBy<T>(string table, string select, string groupBys, SQLConditionCriteria[] wheres, SQLOrderByCriteria[] orderBys, int? limit, int? skip, VOCriteria buVO)

        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            string commWhere = string.Empty;
            string commOrderBy = string.Empty;

            int iField = 0;
            commWhere = GenerateWhereString(wheres.ToList(), commWhere);
            string GenerateWhereString(List<SQLConditionCriteria> wheres,string commWhere)
            {
                if (wheres != null && wheres.Count > 0)
                {
                    commWhere += " ( ";
                    foreach (var w in wheres)
                    {
                        if (w.whereGroups != null && w.whereGroups.Count > 0)
                        {
                            commWhere = GenerateWhereString(w.whereGroups, commWhere);
                        }
                        else
                        {
                            commWhere += string.Format("{3} {0} {1} {2} ",
                                                    w.field,
                                                    w.operatorType.Attribute<ValueAttribute>().Value,
                                                    w.operatorType == SQLOperatorType.ISNULL || w.operatorType == SQLOperatorType.ISNOTNULL ? "" : "@" + w.field + iField,
                                                    iField == 0 ? string.Empty :
                                                        w.conditionLeft == SQLConditionType.NONE ? "AND" : w.conditionLeft.Attribute<ValueAttribute>().Value);

                            object v = null;
                            if (w.value == null) v = null;
                            else if (w.value is string && (w.operatorType == SQLOperatorType.LIKE || w.operatorType == SQLOperatorType.NOTLIKE)) v = w.value.ToString().Replace('*', '%');
                            else if (w.value is string && (w.operatorType == SQLOperatorType.IN || w.operatorType == SQLOperatorType.NOTIN)) v = w.value.ToString().Split(",");
                            else v = w.value;
                            param.Add(w.field + iField, v);
                            iField++;
                        }
                    }
                    commWhere += " ) ";
                }
                return commWhere;
            }
            
            if (orderBys != null)
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
                commTxt = string.Format(@"select {5} from {0} {1} {6} {2} {3} {4} ",
                        table ?? typeof(T).Name.Split('.').Last(),
                        string.IsNullOrEmpty(commWhere) ? string.Empty : " WHERE " + commWhere,
                        string.IsNullOrEmpty(commOrderBy) ? string.Empty : " ORDER BY " + commOrderBy,
                        skip.HasValue ? "OFFSET " + skip.Value + " ROWS" : string.Empty,
                        limit.HasValue ? "FETCH NEXT " + limit.Value+ " ROWS ONLY " : string.Empty,
                        select,
                        string.IsNullOrEmpty(groupBys) ? string.Empty : " GROUP BY " + groupBys);
            }
            else
            {
                commTxt = string.Format(@"select {4} {5} from {0} {1} {6} {2} {3} ",
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
                    buVO == null ? null : buVO.Logger, buVO == null ? null : buVO.SqlTransaction)
                    .ToList();
            return res;
        }

        public string CommandByConfig(string key)
        {
            //if (key.StartsWith("@@sql_")) key = key.Remove(0, 6);
            //else if (key.StartsWith("@@sql")) key = key.Remove(0, 5);

            var conf = key.Split(',');
            var comm = WMSStaticValue.StaticValueManager.GetInstant().GetConfigValue(conf[0]);
            for (int i = 1; i < conf.Length; i++)
            {
                comm = comm.Replace("{" + (i - 1) + "}", conf[i]);
            }
            comm = Regex.Replace(comm, "{[0-9]+}", "");

            return comm;
        }
        public long? UpdateByID<T>(int id, ListKeyValue<string, object> values, VOCriteria buVO)
             where T : IEntityModel
        {
            return UpdateByID<T>((long)id, buVO, values.ToArray());
        }
        public long? UpdateByID<T>(long id, ListKeyValue<string, object> values, VOCriteria buVO)
             where T : IEntityModel
        {
            return UpdateByID<T>(id, buVO, values.ToArray());
        }
        public long? UpdateByID<T>(int id, VOCriteria buVO, params KeyValuePair<string, object>[] values)
             where T : IEntityModel
        {
            return UpdateByID<T>((long)id, buVO, values);
        }
        public long? UpdateByID<T>(long id, VOCriteria buVO, params KeyValuePair<string, object>[] values)
             where T : IEntityModel
        {
            return this.UpdateBy<T>(
                new SQLConditionCriteria[] { new SQLConditionCriteria("ID", id, SQLOperatorType.EQUALS) },
                values,
                buVO);
        }
        public long? UpdateByCode<T>(string code, KeyValuePair<string, object>[] values, VOCriteria buVO)
             where T : IEntityModel
        {
            return this.UpdateBy<T>(
                new SQLConditionCriteria[] { new SQLConditionCriteria("Code", code, SQLOperatorType.EQUALS) }, 
                values,
                buVO);
        }
        public long? UpdateBy<T>(T model, VOCriteria buVO)
             where T : BaseEntityID
        {
            return UpdateByID<T>(model.ID.Value, buVO, model.PropertieFieldKeyValuePairs().ToArray());
        }
        public long? UpdateBy<T>(SQLConditionCriteria[] wheres, KeyValuePair<string, object>[] values, VOCriteria buVO)
             where T : IEntityModel
        {
            string commSets = string.Empty;
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            foreach (var x in Enumerable.ToList(values))
            {
                if (x.Key.In("ID", "CreateBy", "CreateTime", "ModifyBy", "ModifyTime"))
                    continue;

                if (x.Value != null && x.Value.ToString().ToLower().StartsWith("@@sql"))
                {
                    commSets +=
                        string.Format("{0}{1}={1}",
                            string.IsNullOrEmpty(commSets) ? string.Empty : ",",
                            x.Key,
                            this.CommandByConfig(x.Value.ToString()));
                }
                else
                {
                    commSets +=
                        string.Format("{0}{1}=@{1}",
                            string.IsNullOrEmpty(commSets) ? string.Empty : ",",
                            x.Key);
                    param.Add(x.Key, x.Value);
                }
            }
            if (typeof(BaseEntityCreateModify).IsAssignableFrom(typeof(T)))
            {
                commSets += ",ModifyBy=@actionBy,ModifyTime=getdate()";
                param.Add("actionBy", buVO == null ? 0 : buVO.ActionBy);
            }

            string commWhere = string.Empty;
            int iField = 0;
            if (wheres != null)
                foreach (var w in wheres)
                {
                    commWhere += string.Format("{3} {0} {1} {2} ",
                                            w.field,
                                            w.operatorType.Attribute<ValueAttribute>().Value,
                                            w.operatorType == SQLOperatorType.ISNULL || w.operatorType == SQLOperatorType.ISNOTNULL ? "" : "@" + w.field + iField,
                                            w.conditionLeft != SQLConditionType.NONE && !string.IsNullOrEmpty(commWhere) ? w.conditionLeft.Attribute<ValueAttribute>().Value :
                                                string.IsNullOrEmpty(commWhere) ? string.Empty : "AND");

                    object v = null;
                    if (w.value == null) v = null;
                    else if (w.value is string && w.operatorType == SQLOperatorType.LIKE) v = w.value.ToString().Replace('*', '%');
                    else if (w.value is string && w.operatorType == SQLOperatorType.IN) v = w.value.ToString().Split(",");
                    else v = w.value;
                    param.Add(w.field + iField, v);
                    iField++;
                }

            var res = this.ExecuteScalar<long?>(
                    string.Format("update {0} set {1} where {2};SELECT SCOPE_IDENTITY();",
                        typeof(T).Name.Split('.').Last(), commSets, commWhere),
                    CommandType.Text,
                    param,
                    buVO == null ? null : buVO.Logger, buVO == null ? null : buVO.SqlTransaction);
            return res;
        }

        public long? Insert<T>(T data,VOCriteria buVO)
             where T : IEntityModel
        {
            var d = AMWUtil.Common.ObjectUtil.ObjectToKeyValue<T>(data);
            return Insert<T>(d.ToArray(),buVO);
        }

        public long? Insert<T>(ListKeyValue<string, object> values, VOCriteria buVO)
         where T : IEntityModel
        {
            return Insert<T>(values.ToArray(), buVO);
        }
        public long? Insert<T>(KeyValuePair<string, object>[] values, VOCriteria buVO)
         where T : IEntityModel
        {
            string commFields = string.Empty;
            string commVals = string.Empty;
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            foreach (var x in Enumerable.ToList(values))
            {
                if (x.Key.In("ID", "CreateBy", "CreateTime", "ModifyBy", "ModifyTime"))
                    continue;

                commFields +=
                    string.Format("{0}{1}",
                        string.IsNullOrEmpty(commFields) ? string.Empty : ",",
                        x.Key);

                if (x.Value != null && x.Value.ToString().ToLower().StartsWith("@@sql"))
                {
                    commVals +=
                        string.Format("{0}{1}",
                            string.IsNullOrEmpty(commVals) ? string.Empty : ",",
                            this.CommandByConfig(x.Value.ToString()));
                }
                else
                {
                    commVals +=
                    string.Format("{0}@{1}",
                        string.IsNullOrEmpty(commVals) ? string.Empty : ",",
                        x.Key);
                    param.Add(x.Key, x.Value);
                }
            };
            if (typeof(BaseEntityCreateOnly).IsAssignableFrom(typeof(T)))
            {
                commFields += ",CreateBy,CreateTime";
                commVals += ",@actionBy,getdate()";
                param.Add("actionBy", buVO == null ? 0 : buVO.ActionBy);
            }

            var commTxt =
                    string.Format("insert into {0} ({1}) values ({2});SELECT SCOPE_IDENTITY();",
                        typeof(T).Name.Split('.').Last(), commFields, commVals);
            var res = this.ExecuteScalar<long?>(
                    commTxt,
                    CommandType.Text,
                    param,
                    buVO == null ? null : buVO.Logger, buVO == null ? null : buVO.SqlTransaction);

            return res;
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

        public List<T> QueryString<T>(string sqlComm, Dapper.DynamicParameters parameters, VOCriteria buVO)
        {
            List<T> res = this.Query<T>(sqlComm, CommandType.Text, parameters, buVO.Logger, buVO.SqlTransaction).ToList();
            return res;
        }
        public List<T> QueryString<T>(string sqlComm, Dapper.DynamicParameters parameters)
        {
            List<T> res = this.Query<T>(sqlComm, CommandType.Text, parameters, null, null).ToList();
            return res;
        }
    }
}
