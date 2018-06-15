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
    }
}
