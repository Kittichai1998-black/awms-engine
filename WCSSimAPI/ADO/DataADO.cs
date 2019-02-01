using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WCSSimAPI.ADO
{
    public class DataADO : BaseMSSQLAccess<DataADO>
    {
        public dynamic ssp_post_receive_inbound(System.Data.SqlClient.SqlTransaction trans)
        {
            Dapper.DynamicParameters datas = new Dapper.DynamicParameters();
            datas.Add("barcode", null, System.Data.DbType.String, System.Data.ParameterDirection.Output);
            datas.Add("sJson", null, System.Data.DbType.String, System.Data.ParameterDirection.Output);
            var res = this.Execute(
               "api.ssp_post_receive_inbound",
               System.Data.CommandType.StoredProcedure,
               datas, null, trans);

            return res;
        }

        public dynamic ssp_post_response_inbound(System.Data.SqlClient.SqlTransaction trans, string _basecode, string _json)
        {
            Dapper.DynamicParameters datas = new Dapper.DynamicParameters();
            datas.Add("_basecode", _basecode);
            datas.Add("_json", _json);
            datas.Add("_retchk", null, System.Data.DbType.String, System.Data.ParameterDirection.Output);
            datas.Add("_retmsg", null, System.Data.DbType.String, System.Data.ParameterDirection.Output);
            var res = this.Query<dynamic>(
               "api.ssp_post_response_inbound",
               System.Data.CommandType.StoredProcedure,
               datas, null, trans).ToList();

            return res;
        }
    }
}
