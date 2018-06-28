﻿using AMWUtil.Logger;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.ADO
{
    public class InsUpdADO : BaseMSSQLAccess<InsUpdADO>
    {
        public int InsUpd(string table_name, List<Dictionary<string,dynamic>> recvlist, string con, bool revision,
            AMWLogger logger, SqlTransaction trans = null)
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

                if(revision == true)
                {
                    insupd = string.Format("update {0} set {1} , [Status] = 2 where {2}",
                        table_name,
                        update.Substring(2),
                        condition);

                    this.Execute(insupd,
                                    CommandType.Text, param, logger, trans);

                    insupd = string.Format("insert into {0} ({1}) values ({2})",
                        table_name,
                        columns.Substring(2),
                        "@" + parameter.Substring(3));

                    res = this.Execute(insupd,
                                    CommandType.Text, param, logger, trans) + res;
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
                                    CommandType.Text, param, logger, trans) + res;
                }
            }
            return res;
        }
    }
}
