using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WCSSimAPI.ADO
{
    public class DataADO : BaseMSSQLAccess<DataADO>
    {
        public class TJsonRequest
        {
            public string basecode;
            public string sJson;
        }
        public class TJsonResponse
        {
            public string _retchk;
            public string _retmsg;
            public string _retjson;
        }
        public TJsonRequest list_request_wms_register_queue(System.Data.SqlClient.SqlTransaction trans)
        {
            Dapper.DynamicParameters datas = new Dapper.DynamicParameters();
            datas.Add("basecode", null, System.Data.DbType.String, System.Data.ParameterDirection.Output);
            datas.Add("sJson", null, System.Data.DbType.String, System.Data.ParameterDirection.Output);
            this.Execute(
               "api.ssp_post_receive_inbound",
               System.Data.CommandType.StoredProcedure,
               datas, null, trans);

            var res = new TJsonRequest { basecode = datas.Get<string>("basecode"), sJson = datas.Get<string>("sJson") };
            return res;
        }
        public TJsonRequest list_request_wms_working(System.Data.SqlClient.SqlTransaction trans)
        {
            Dapper.DynamicParameters datas = new Dapper.DynamicParameters();
            datas.Add("basecode", null, System.Data.DbType.String, System.Data.ParameterDirection.Output);
            datas.Add("sJson", null, System.Data.DbType.String, System.Data.ParameterDirection.Output);
            this.Execute(
               "api.ssp_post_working_stage",
               System.Data.CommandType.StoredProcedure,
               datas, null, trans);

            var res = new TJsonRequest { basecode = datas.Get<string>("basecode"), sJson = datas.Get<string>("sJson") };
            return res;
        }
        public TJsonRequest list_request_wms_done(System.Data.SqlClient.SqlTransaction trans)
        {
            Dapper.DynamicParameters datas = new Dapper.DynamicParameters();
            datas.Add("basecode", null, System.Data.DbType.String, System.Data.ParameterDirection.Output);
            datas.Add("sJson", null, System.Data.DbType.String, System.Data.ParameterDirection.Output);
            this.Execute(
               "[api].[ssp_post_complete]",
               System.Data.CommandType.StoredProcedure,
               datas, null, trans);

            var res = new TJsonRequest { basecode = datas.Get<string>("basecode"), sJson = datas.Get<string>("sJson") };
            return res;
        }
        public TJsonRequest list_request_wms_location_info(System.Data.SqlClient.SqlTransaction trans)
        {
            Dapper.DynamicParameters datas = new Dapper.DynamicParameters();
            datas.Add("basecode", null, System.Data.DbType.String, System.Data.ParameterDirection.Output);
            datas.Add("sJson", null, System.Data.DbType.String, System.Data.ParameterDirection.Output);
            this.Execute(
               "[api].[ssp_post_get_location_info]",
               System.Data.CommandType.StoredProcedure,
               datas, null, trans);

            var res = new TJsonRequest { basecode = datas.Get<string>("basecode"), sJson = datas.Get<string>("sJson") };
            return res;
        }


        
        public TJsonResponse set_response_wms_register_queue(System.Data.SqlClient.SqlTransaction trans, string _basecode, string _json)
        {
            Dapper.DynamicParameters datas = new Dapper.DynamicParameters();
            datas.Add("_basecode", _basecode);
            datas.Add("_json", _json);
            datas.Add("_retchk", null, System.Data.DbType.String, System.Data.ParameterDirection.Output);
            datas.Add("_retmsg", null, System.Data.DbType.String, System.Data.ParameterDirection.Output);
            this.Execute(
               "api.ssp_post_response_inbound",
               System.Data.CommandType.StoredProcedure,
               datas, null, trans);

            var res = new TJsonResponse { _retchk = datas.Get<string>("_retchk"), _retmsg = datas.Get<string>("_retmsg") };
            return res;
        }
        public TJsonResponse set_response_wms_working(System.Data.SqlClient.SqlTransaction trans, string _basecode, string _json)
        {
            Dapper.DynamicParameters datas = new Dapper.DynamicParameters();
            datas.Add("_basecode", _basecode);
            datas.Add("_json", _json);
            datas.Add("_retchk", null, System.Data.DbType.String, System.Data.ParameterDirection.Output);
            datas.Add("_retmsg", null, System.Data.DbType.String, System.Data.ParameterDirection.Output);
            this.Execute(
               "api.ssp_post_response_working_stage",
               System.Data.CommandType.StoredProcedure,
               datas, null, trans);

            var res = new TJsonResponse { _retchk = datas.Get<string>("_retchk"), _retmsg = datas.Get<string>("_retmsg") };
            return res;
        }
        public TJsonResponse set_response_wms_done(System.Data.SqlClient.SqlTransaction trans, string _basecode, string _json)
        {
            Dapper.DynamicParameters datas = new Dapper.DynamicParameters();
            datas.Add("_basecode", _basecode);
            datas.Add("_json", _json);
            datas.Add("_retchk", null, System.Data.DbType.String, System.Data.ParameterDirection.Output);
            datas.Add("_retmsg", null, System.Data.DbType.String, System.Data.ParameterDirection.Output);
            this.Execute(
               "api.ssp_post_response_complete",
               System.Data.CommandType.StoredProcedure,
               datas, null, trans);

            var res = new TJsonResponse { _retchk = datas.Get<string>("_retchk"), _retmsg = datas.Get<string>("_retmsg") };
            return res;
        }
        public TJsonResponse set_response_wms_location_info(System.Data.SqlClient.SqlTransaction trans, string _basecode, string _json)
        {
            Dapper.DynamicParameters datas = new Dapper.DynamicParameters();
            datas.Add("_basecode", _basecode);
            datas.Add("_json", _json);
            datas.Add("_retchk", null, System.Data.DbType.String, System.Data.ParameterDirection.Output);
            datas.Add("_retmsg", null, System.Data.DbType.String, System.Data.ParameterDirection.Output);
            this.Execute(
               "api.ssp_post_response_get_location_info",
               System.Data.CommandType.StoredProcedure,
               datas, null, trans);

            var res = new TJsonResponse { _retchk = datas.Get<string>("_retchk"), _retmsg = datas.Get<string>("_retmsg") };
            return res;
        }

        public dynamic set_wcs_register_queue(System.Data.SqlClient.SqlTransaction trans, string _json)
        {
            Dapper.DynamicParameters datas = new Dapper.DynamicParameters();
            //datas.Add("_basecode", _basecode);
            datas.Add("_json", _json);
            datas.Add("_retchk", null, System.Data.DbType.String, System.Data.ParameterDirection.Output);
            datas.Add("_retmsg", null, System.Data.DbType.String, System.Data.ParameterDirection.Output);
            datas.Add("_retjson", null, System.Data.DbType.String, System.Data.ParameterDirection.Output);
            this.Execute(
               "api.ssp_post_response_outbound",
               System.Data.CommandType.StoredProcedure,
               datas, null, trans);

            var res = new TJsonResponse { _retchk = datas.Get<string>("_retchk"), _retmsg = datas.Get<string>("_retmsg")
                , _retjson = datas.Get<string>("_retjson")
            };
            return res;
        }
    }
}
