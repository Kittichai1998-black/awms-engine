using AMWUtil.Logger;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace ADO.WMSDB
{
    public class TokenADO : BaseWMSDB<TokenADO>
    {
        public amt_Token Register(string username, string password, string secretKey, int actionBy, bool requirePass,
            VOCriteria buVO)
        {
            var param = new Dapper.DynamicParameters();
            param.Add("@username", username);
            param.Add("@password", password);
            param.Add("@secretKey", secretKey);
            param.Add("@actionBy", actionBy);
            param.Add("@requirePass", requirePass);
            var res = this.Query<amt_Token>(
                                "SP_TOKEN_REGISTER",
                                CommandType.StoredProcedure,param, buVO.Logger, buVO.SqlTransaction)
                            .FirstOrDefault();
            return res;
        }

        public amt_Token LDAP(string secretKey, int actionBy,
            VOCriteria buVO)
        {
            var param = new Dapper.DynamicParameters();
            param.Add("@secretKey", secretKey);
            param.Add("@actionBy", actionBy);
            var res = this.Query<amt_Token>(
                                "SP_LDAP_REGISTER",
                                CommandType.StoredProcedure,param, buVO.Logger, buVO.SqlTransaction)
                            .FirstOrDefault();
            return res;
        }

        public amt_Token_status Remove(string token, string secretKey, int actionBy,
            VOCriteria buVO)
        {
            var param = new Dapper.DynamicParameters();
            param.Add("@token", token);
            param.Add("@secretKey", secretKey);
            param.Add("@actionBy", actionBy);
            var res = this.Query<amt_Token_status>(
                                "SP_TOKEN_REMOVE",
                                CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction)
                            .FirstOrDefault();
            return res;
        }

        public amt_Token_status Enquiry(string token,
            VOCriteria buVO)
        {
            var param = new Dapper.DynamicParameters();
            param.Add("@token", token);
            var res = this.Query<amt_Token_status>(
                                "SP_TOKEN_ENQUIRY",
                                CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction)
                            .FirstOrDefault();
            return res;
        }

        public amt_Token_ext Extend(string token, string extendKey, int actionBy,
            VOCriteria buVO)
        {
            var param = new Dapper.DynamicParameters();
            param.Add("@token", token);
            param.Add("@extendKey", extendKey);
            param.Add("@actionBy", actionBy);
            var res = this.Query<amt_Token_ext>(
                                "SP_TOKEN_EXTEND",
                                CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction)
                            .FirstOrDefault();
            return res;
        }

        public string  Authen(string Token, string APIKey,long APIServiceID,
           VOCriteria buVO)
        {
            var param = new Dapper.DynamicParameters();
            param.Add("@Token", Token);
            param.Add("@APIKey", APIKey);
            param.Add("@APIServiceID", APIServiceID);
            var res = this.Query<string>(
                                "SP_AUTHEN",
                                CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction)
                            .FirstOrDefault();
            return res;
        }

       
    }
}
