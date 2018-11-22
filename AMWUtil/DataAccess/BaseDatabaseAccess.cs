using AMWUtil.Common;
using AMWUtil.Logger;
using Dapper;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace AMWUtil.DataAccess
{
    public abstract class BaseDatabaseAccess
    {

        private string _ConnectionString;// = "Server=191.20.2.29;Uid=sa;PASSWORD=abc123;database=smartsale_dev;Max Pool Size=400;Connect Timeout=600;";
        public string ConnectionString => _ConnectionString;
        public BaseDatabaseAccess(string connectionString)
        {
            this._ConnectionString = connectionString;
        }

        private string DynamicParametersToString(DynamicParameters parameter)
        {
            if (parameter == null) return string.Empty;
            return string.Join(" , ", parameter.ParameterNames.ToList().Select(x => string.Format("@{0}='{1}'", x, parameter.Get<object>(x))));
        }

        protected IEnumerable<T> Query<T>(
            string spName,
            CommandType commandType,
            DynamicParameters parameter,
            AMWLogger logger,
            SqlTransaction transaction = null)
        {
            IEnumerable<T> res = null;
            if (logger != null) logger.LogInfo("Query = " + spName + " | " + this.DynamicParametersToString(parameter));
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

        protected T ExecuteScalar<T>(
            string cmdTxt,
            CommandType commandType,
            DynamicParameters parameter,
            AMWLogger logger,
            SqlTransaction transaction = null)
        {
            T res;
            if (logger != null) logger.LogInfo("ExecuteScalar = " + cmdTxt + " | " + this.DynamicParametersToString(parameter));
            if (transaction == null)
            {
                using (SqlConnection Connection = new SqlConnection(this.ConnectionString))
                {
                    res = Connection.ExecuteScalar<T>(cmdTxt, parameter, transaction, 60, commandType);
                }
            }
            else
            {
                res = transaction.Connection.ExecuteScalar<T>(cmdTxt, parameter, transaction, 60, commandType);
            }
            if (logger != null) logger.LogInfo("ExecuteScalar OK = " + cmdTxt);
            return res;
        }

        protected int Execute(
            string cmdTxt, 
            CommandType commandType,
            DynamicParameters parameter,
            AMWLogger logger,
            SqlTransaction transaction = null)
        {
            int res;
            if (logger != null) logger.LogInfo("Execute = " + cmdTxt + " | " + this.DynamicParametersToString(parameter));
            if (transaction == null)
            {
                using (SqlConnection Connection = new SqlConnection(this.ConnectionString))
                {
                    res = Connection.Execute(cmdTxt, parameter, transaction, 60, commandType);
                }
            }
            else
            {
                res = transaction.Connection.Execute(cmdTxt, parameter, transaction, 60, commandType);
            }
            if (logger != null) logger.LogInfo("Execute OK = " + cmdTxt);
            return res;
        }

        public DynamicParameters CreateDynamicParameters(object criteria, params string[] paramUnSets)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            Enumerable.ToList(criteria.GetType().GetFields())
                .ForEach(x => {
                    if (!paramUnSets.Any(y => y.Equals(x.Name)))
                    {
                        var val = x.GetValue(criteria);
                        var v = ObjectUtil.IsEmptyNull(val) ? null : val;
                        param.Add(x.Name, v);
                    }
                });
            return param;
        }

        public SqlConnection CreateConnection()
        {
            SqlConnection conn = new SqlConnection(ConnectionString);
            return conn;
        }
        public SqlTransaction CreateTransaction(string transName = null)
        {
            var conn = CreateConnection();
            conn.Open();
            return conn.BeginTransaction(transName);
        }
    }
}
