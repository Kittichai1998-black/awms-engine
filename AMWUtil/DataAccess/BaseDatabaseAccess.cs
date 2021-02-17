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
        public string ConnectionString { get => _ConnectionString; set => _ConnectionString = value; }
        public BaseDatabaseAccess(string connectionString)
        {
            this._ConnectionString = connectionString;
        }

        public static string DynamicParametersToString(DynamicParameters parameter)
        {
            if (parameter == null) return string.Empty;
            return string.Join(" , ", parameter.ParameterNames.ToList().Select(x =>
            {
                object v = parameter.Get<object>(x);
                if(v == null)
                    return string.Format("@{0}=NULL", x);
                if (v is bool)
                    return string.Format("@{0}={1}", x, (bool)v ? 1 : 0);
                return string.Format("@{0}='{1}'", x, v.Json());
            }));
        }

        protected IEnumerable<T> Query<T>(
            string cmdTxt,
            CommandType commandType,
            DynamicParameters parameter,
            AMWLogger logger,
            SqlTransaction transaction = null,
            SqlConnection conn = null)
        {
            IEnumerable<T> res = null;
            DateTime dt = DateTime.Now;
            try
            {
                if (transaction != null)
                {
                    res = transaction.Connection.Query<T>(cmdTxt, parameter, transaction, true, 60, commandType);
                }
                else if (conn != null)
                {
                    res = conn.Query<T>(cmdTxt, parameter, null, true, 60, commandType);
                }
                else
                {
                    using (SqlConnection Connection = new SqlConnection(this.ConnectionString))
                    {
                        Connection.Open();
                        transaction = Connection.BeginTransaction(IsolationLevel.Snapshot);
                        res = Connection.Query<T>(cmdTxt, parameter, transaction, true, 60, commandType);
                        transaction.Commit();
                    }
                }
            }
            catch
            {
                throw;
            }
            finally
            {
                if (logger != null)
                    logger.LogDebug(string.Format("[QUERY] [{0}ms] rows={1} | {2}; {3}",
                        (DateTime.Now - dt).TotalMilliseconds,
                        (res == null ? "" : res.ToString()),
                        cmdTxt,
                        DynamicParametersToString(parameter)
                        ));
            }
            return res;
        }

        protected T ExecuteScalar<T>(
            string cmdTxt,
            CommandType commandType,
            DynamicParameters parameter,
            AMWLogger logger,
            SqlTransaction transaction = null,
            SqlConnection conn = null)
        {
            T res;
            object res2 = null;
            DateTime dt = DateTime.Now;
            try
            {
                
                if (transaction != null)
                {
                    res = transaction.Connection.ExecuteScalar<T>(cmdTxt, parameter, transaction, 60, commandType);
                }
                else if (conn != null)
                {
                    res = conn.ExecuteScalar<T>(cmdTxt, parameter, null, 60, commandType);
                }
                else
                {
                    using (SqlConnection Connection = new SqlConnection(this.ConnectionString))
                    {
                        Connection.Open();
                        transaction = Connection.BeginTransaction(IsolationLevel.Snapshot);
                        res = Connection.ExecuteScalar<T>(cmdTxt, parameter, transaction, 60, commandType);
                        transaction.Commit();

                    }
                }
                res2 = res;
            }
            catch
            {
                throw;
            }
            finally
            {
                if (logger != null)
                    logger.LogDebug(string.Format("[SCALAR] [{0}ms] value={1} | {2} {3}",
                        (DateTime.Now - dt).TotalMilliseconds,
                        res2,
                        cmdTxt,
                        DynamicParametersToString(parameter)
                        ));
            }
            return res;
        }

        protected int Execute(
            string cmdTxt, 
            CommandType commandType,
            DynamicParameters parameter,
            AMWLogger logger,
            SqlTransaction transaction = null,
            SqlConnection conn = null)
        {
            int res = -1;
            var dt = DateTime.Now;
            try
            {
                if (transaction != null)
                {
                    res = transaction.Connection.Execute(cmdTxt, parameter, transaction, 60, commandType);
                }
                else if (conn != null)
                {
                    res = conn.Execute(cmdTxt, parameter, null, 60, commandType);
                }
                else
                {
                    using (SqlConnection Connection = new SqlConnection(this.ConnectionString))
                    {
                        Connection.Open();
                        transaction = Connection.BeginTransaction(IsolationLevel.Snapshot);
                        res = Connection.Execute(cmdTxt, parameter, transaction, 60, commandType);
                        transaction.Commit();
                    }
                }

            }
            catch
            {
                throw;
            }
            finally
            {
                if (logger != null)
                    logger.LogDebug(string.Format("[EXEC] [{0}ms] status={1} | {2}; {3}",
                        (DateTime.Now - dt).TotalMilliseconds,
                        res,
                        cmdTxt,
                        DynamicParametersToString(parameter)
                        ));
            }
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
            conn.Open();
            return conn;
        }
        public SqlTransaction CreateTransaction(string transName = null, IsolationLevel isolationLevel = IsolationLevel.Snapshot)
        {
            var conn = CreateConnection();
            conn.Open();
            var trans =  conn.BeginTransaction(isolationLevel, transName);
            return trans;
        }
    }
}
