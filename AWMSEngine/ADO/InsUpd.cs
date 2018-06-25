using AMWUtil.Logger;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.ADO
{
    public class InsUpd : BaseMSSQLAccess<InsUpd>
    {
        public int Insert(string table_name, Dictionary<string,dynamic> recvlist,
            AMWLogger logger, SqlTransaction trans = null)
        {
            Dictionary<string, dynamic> selectlist = new Dictionary<string, dynamic>();
            var param = new Dapper.DynamicParameters();
            foreach(var data in recvlist.Skip(1))
            {
                param.Add("@" + data.Key.ToString(), data.Value);
                selectlist.Add(data.Key.ToString(), data.Value);
            }

            string columns = "";
            string parameter = "";
            foreach (var rowlist in selectlist)
            {
                columns = columns + ", " + rowlist.Key;
                parameter = parameter + ", @" + rowlist.Key;
            }

            string ins = string.Format("insert into {0} ({1}) values ({2})",
                table_name, 
                columns.Substring(2),
                parameter.Substring(3));

            var res = this.Query<int>(ins,
                                CommandType.Text, param, logger, trans)
                            .FirstOrDefault();
            return res;
        }

        public int Update(string table_name, Dictionary<string, dynamic> updlist, Dictionary<string, dynamic> conlist,
            AMWLogger logger, SqlTransaction trans = null)
        {
            var selectlist = new Dictionary<string, dynamic>();
            var selectconlist = new Dictionary<string, dynamic>();
            var param = new Dapper.DynamicParameters();
            foreach (var data in updlist.Skip(1))
            {
                param.Add("@" + data.Key.ToString(), data.Value);
                selectlist.Add(data.Key.ToString(), data.Value);
            }
            foreach (var data in conlist)
            {
                param.Add("@" + data.Key.ToString(), data.Value);
                selectconlist.Add(data.Key.ToString(), data.Value);
            }

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
                                CommandType.Text, param, logger, trans)
                            .FirstOrDefault();
            return res;
        }
    }
}
