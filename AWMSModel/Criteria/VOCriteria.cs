using AMWUtil.DataAccess.Http;
using AMWUtil.Logger;
using AWMSModel.Constant.StringConst;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Text;
using Z.Expressions;

namespace AWMSModel.Criteria
{
    public class VOCriteria
    {
        private Dictionary<string, object> VO { get; set; }
        
        public VOCriteria(AMWLogger logger, SqlConnection sqlConnection)
        {
            this.VO = new Dictionary<string, object>();
            this.Logger = logger;
            this.SqlConnection = sqlConnection;
            //this.Set(Constant.StringConst.BusinessVOConst.KEY_LOGGER, logger);
            //this.Set(Constant.StringConst.BusinessVOConst.KEY_DB_CONNECTION, sqlConnection);
        }
        public VOCriteria()
        {
            this.VO = new Dictionary<string, object>();
        }

        public void Set(string key, dynamic val)
        {
            if (!this.VO.ContainsKey(key))
                this.VO.Add(key, val);
            else
                this.VO[key] = val;
        }

        public T Get<T>(string key)
        {
            if (this.VO.ContainsKey(key))
                return (T)this.VO[key];
            return default(T);
        }
        public T Get<T>(string key, T defaultValue)
        {
            T res = this.Get<T>(key);
            if (res == null)
                return defaultValue;
            return res;
        }
        public string GetString(string key)
        {
            try
            {
                var res = this.Get<string>(key);
                return res;
            }
            catch
            {
                return null;
            }
        }
        public dynamic GetDynamic(string key)
        {
            try
            {
                var res = this.Get<dynamic>(key);
                return res;
            }
            catch
            {
                return null;
            }
        }



        public void SqlTransaction_Begin()
        {
            var trans = this.SqlConnection.BeginTransaction(this.Logger.LogRefID);
            this.SqlTransaction = trans;
        }
        public void SqlTransaction_Commit()
        {
            var trans = this.SqlTransaction;
            if (trans != null && trans.Connection != null && trans.Connection.State == System.Data.ConnectionState.Open)
            {
                var conn = trans.Connection;
                trans.Commit();
                trans.Dispose();
                this.SqlTransaction = null;
            }
        }
        public void SqlTransaction_Rollback()
        {
            var trans = this.SqlTransaction;
            if (trans != null && trans.Connection != null && trans.Connection.State == System.Data.ConnectionState.Open)
            {
                var conn = trans.Connection;
                trans.Rollback();
                trans.Dispose();
                this.SqlTransaction = null;
            }
        }
        public void SqlConnection_Close()
        {
            var conn = this.SqlConnection;
            if (conn != null && conn.State == System.Data.ConnectionState.Open)
            {
                conn.Close();
                conn.Dispose();
                this.SqlConnection = null;
            }
        }

        public SqlConnection SqlConnection
        {
            get { return this.Get<SqlConnection>(BusinessVOConst.KEY_DB_CONNECTION); }
            private set { this.Set(BusinessVOConst.KEY_DB_CONNECTION, value); }
        }
        public SqlTransaction SqlTransaction
        {
            get { return this.Get<SqlTransaction>(BusinessVOConst.KEY_DB_TRANSACTION); }
            private set { this.Set(BusinessVOConst.KEY_DB_TRANSACTION, value); }
        }
        public AMWLogger Logger { 
            get => this.Get<AMWLogger>(BusinessVOConst.KEY_LOGGER);
            private set { this.Set(BusinessVOConst.KEY_LOGGER, value); }
        }

        public List<HttpResultModel> FinalLogSendAPIEvent
        {
            get => this.Get<FinalDatabaseLogCriteria>(BusinessVOConst.KEY_FINAL_DB_LOG).sendAPIEvents;
        }
        public List<FinalDatabaseLogCriteria.DocumentOptionMessage> FinalLogDocMessage
        {
            get => this.Get<FinalDatabaseLogCriteria>(BusinessVOConst.KEY_FINAL_DB_LOG).documentOptionMessages;
        }
        public int ActionBy
        {
            get
            {
                var tokenInfo = this.Get<amt_Token>(BusinessVOConst.KEY_TOKEN_INFO);
                if (tokenInfo != null) return tokenInfo.User_ID;
                return 0;
            }
        }
        public string APIRefID
        {
            get
            {
                var apiRefID = this.Get<string>(BusinessVOConst.KEY_APIREFID);
                return apiRefID;
            }
        }
    }
}
