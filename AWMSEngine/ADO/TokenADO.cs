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
    public class TokenADO : BaseMSSQLAccess<TokenADO>
    {
        public amt_Token Register(string username, string password, string secretKey, int actionBy,
            AMWLogger logger, SqlTransaction trans = null)
        {
            var param = new Dapper.DynamicParameters();
            param.Add("@username", username);
            param.Add("@password", password);
            param.Add("@secretKey", secretKey);
            param.Add("@actionBy", actionBy);
            var res = this.Query<amt_Token>(
                                "SP_TOKEN_REGISTER",
                                CommandType.StoredProcedure,param,logger,trans)
                            .FirstOrDefault();
            return res;
        }

        public amt_Token_status Remove(string token, string secretKey, int actionBy,
            AMWLogger logger, SqlTransaction trans = null)
        {
            var param = new Dapper.DynamicParameters();
            param.Add("@token", token);
            param.Add("@secretKey", secretKey);
            param.Add("@actionBy", actionBy);
            var res = this.Query<amt_Token_status>(
                                "SP_TOKEN_REMOVE",
                                CommandType.StoredProcedure, param, logger, trans)
                            .FirstOrDefault();
            return res;
        }

        public amt_Token_status Enquiry(string token, string secretKey,
            AMWLogger logger, SqlTransaction trans = null)
        {
            var param = new Dapper.DynamicParameters();
            param.Add("@token", token);
            param.Add("@secretKey", secretKey);
            var res = this.Query<amt_Token_status>(
                                "select token, status from amt_Token where token = @token and ClientSecret_SecretKey = @secretKey",
                                CommandType.Text, param, logger, trans)
                            .FirstOrDefault();
            return res;
        }
    }
}
