﻿using AMWUtil.Logger;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

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
            return SelectBy<T>("ID", value, buVO);
        }
        public List<T> SelectByCode<T>(object value, VOCriteria buVO)
             where T : IEntityModel
        {
            return SelectBy<T>("Code", value, buVO);
        }
        public List<T> SelectBy<T>(string whereField, object value, VOCriteria buVO)
            where T : IEntityModel
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("@value", value);
            var res = this.Query<T>(
                    string.Format("select * from {0} where {1}=@value",
                        typeof(T).Name.Split('.').Last(), whereField),
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
            values.ToList().ForEach(x => {
                commSets +=
                    string.Format("{1}{0}=@{0}",
                        x,
                        string.IsNullOrEmpty(commSets) ? string.Empty : ",");
                param.Add(x.Key, x.Value);
            });
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
