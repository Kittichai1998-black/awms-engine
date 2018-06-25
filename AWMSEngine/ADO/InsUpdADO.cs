using AMWUtil.Logger;
using AWMSModel.Entity;
using Dapper;
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
        public IEnumerable<int> Insert(string table_name, List<Dictionary<string,dynamic>> recvlist,
            AMWLogger logger, SqlTransaction trans = null)
        {
            Dictionary<dynamic, dynamic> selectlist = new Dictionary<dynamic, dynamic>();
            var param = new List<DynamicParameters>();
            foreach (var listdata in recvlist)
            {
                foreach (var dictlist in listdata)
                {
                    var p = new DynamicParameters();
                    p.Add("@" + dictlist.Key, dictlist.Value);
                    param.Add(p);
                }

                if (selectlist.Count == 0)
                    selectlist.Add(listdata.Keys, listdata.Values);
            }

            string columns = "";
            string parameter = "";
            foreach (var rowlist in selectlist.Keys)
            {
                foreach (var row in rowlist)
                {
                    columns = columns + ", " + row;
                    parameter = parameter + ", @" + row;
                }
            }

            string ins = string.Format("insert into {0} ({1}) values ({2})",
                table_name, 
                columns.Substring(2),
                "@" + parameter.Substring(3));

            var res = this.SqlQuery<int>(ins,
                                CommandType.Text, param, logger, trans);
            return res;
        }

        public IEnumerable<int> Update(string table_name, List<Dictionary<string, dynamic>> updlist, List<Dictionary<string, dynamic>> conlist,
            AMWLogger logger, SqlTransaction trans = null)
        {
            var selectlist = new Dictionary<string, dynamic>();
            var selectconlist = new Dictionary<string, dynamic>();
            var param = new Dapper.DynamicParameters();
            //foreach (var data in updlist)
            //{
            //    param.Add("@" + data.Key.ToString(), data.Value);
            //    selectlist.Add(data.Key.ToString(), data.Value);
            //}
            //foreach (var data in conlist)
            //{
            //    param.Add("@" + data.Key.ToString(), data.Value);
            //    selectconlist.Add(data.Key.ToString(), data.Value);
            //}

            string update = "";
            string condition = "";
            foreach (var rowlist in selectlist)
            {
                update = update + ", " + rowlist.Key + " = @" + rowlist.Key;
            }

            foreach (var rowlist in selectconlist)
            {
                condition = condition + " AND " + rowlist.Key + " = @" + rowlist.Key;
            }

            string upd = string.Format("update {0} set {1} where {2}",
                table_name,
                update.Substring(2),
                condition.Substring(5));

            var res = this.Query<int>(upd,
                                CommandType.Text, param, logger, trans);
            return res;
        }

        private IEnumerable<T> SqlQuery<T>(
            string spName,
            CommandType commandType,
            List<DynamicParameters> parameter,
            AMWLogger logger,
            SqlTransaction transaction = null)
        {
            IEnumerable<T> res = null;
            if (logger != null) logger.LogInfo("Query = " + spName);
            if (transaction == null)
            {
                using (SqlConnection Connection = new SqlConnection(this.ConnectionString))
                {
                    res = Connection.Query<T>(spName, parameter, transaction, true, 60, commandType);
                }
            }
            else
            {
                res = transaction.Connection.Query<T>(spName, parameter, transaction, true, 60, commandType);
            }
            if (logger != null) logger.LogInfo("Query OK = " + spName);
            return res;
        }
    }
}
