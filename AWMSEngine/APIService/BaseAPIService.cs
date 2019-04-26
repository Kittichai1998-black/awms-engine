using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.ADO;
using AWMSEngine.Engine.General;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Dynamic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService
{
    public abstract class BaseAPIService
    {
        public abstract int APIServiceID();
        public VOCriteria BuVO { get; set; }
        public ControllerBase ControllerAPI { get; set; }
        public dynamic RequestVO { get => this.BuVO.GetDynamic(BusinessVOConst.KEY_REQUEST); }
        private bool IsAuthenAuthorize { get; set; }

        public AMWLogger Logger { get; set; }

        protected abstract dynamic ExecuteEngineManual();

        public BaseAPIService(ControllerBase controllerAPI, bool isAuthenAuthorize = true)
        {
            this.IsAuthenAuthorize = isAuthenAuthorize;
            this.ControllerAPI = controllerAPI;
        }

        private SqlConnection _SqlConnection = null;
        protected void BeginTransaction()
        {
            this.RollbackTransaction();
            var trans = ADO.BaseMSSQLAccess<ADO.DataADO>.GetInstant().CreateTransaction(this.Logger.LogRefID);
            this._SqlConnection = trans.Connection;
            this.BuVO.Set(BusinessVOConst.KEY_DB_TRANSACTION, trans);
        }
        protected void CommitTransaction()
        {
            var trans = this.BuVO.SqlTransaction;
            if (trans !=null && trans.Connection != null && trans.Connection.State == System.Data.ConnectionState.Open)
            {
                var conn = trans.Connection;
                trans.Commit();
                trans.Dispose();
                if (conn != null)
                    conn.Close();
                this.BuVO.SqlTransaction = null;
                this._SqlConnection = null;
            }
        }
        protected void RollbackTransaction()
        {
            var trans = this.BuVO.SqlTransaction;
            if (trans != null && trans.Connection != null && trans.Connection.State == System.Data.ConnectionState.Open)
            {
                var conn = trans.Connection;
                trans.Rollback();
                trans.Dispose();
                if (conn != null)
                    conn.Close();
                this.BuVO.SqlTransaction = null;
                this._SqlConnection = null;
            }
        }

        private class _GetKey
        {
            public string token;
            public string _token;
            public string apikey;
            public string _apikey;
        }

        public dynamic Execute(dynamic request)
        {
            this.BuVO = new VOCriteria();
            dynamic response = new { };
            dynamic result = new ExpandoObject();
            long dbLogID = 0;
            string token = null;
            string apiKey = null;
            try
            {
                /*var getKey = this.ControllerAPI == null ? null : 
                    ObjectUtil.QueryStringToObject(this.ControllerAPI.Request.QueryString.Value);
                if (getKey.token != null)
                    token = getKey.token;
                else if (getKey._token != null)
                    token = getKey._token;

                if (getKey.apiKey != null)
                    apiKey = getKey.apiKey;
                else if (getKey._apiKey != null)
                    apiKey = getKey._apiKey;
                else if (getKey.apikey != null)
                    apiKey = getKey.apikey;
                else if (getKey._apikey != null)
                    apiKey = getKey._apikey;*/


                if (request != null)
                {
                    string _getKeyJson = Newtonsoft.Json.JsonConvert.SerializeObject(request);
                    _GetKey getKey = Newtonsoft.Json.JsonConvert.DeserializeObject<_GetKey>(_getKeyJson);

                    token = !string.IsNullOrWhiteSpace(getKey.token) ? getKey.token : getKey._token;
                    apiKey = !string.IsNullOrWhiteSpace(getKey.apikey) ? getKey.apikey : getKey._apikey;
                }

                if (!string.IsNullOrWhiteSpace(token))
                    this.Logger = AMWLoggerManager.GetLogger(token, this.GetType().Name);
                else if (!string.IsNullOrWhiteSpace(apiKey))
                    this.Logger = AMWLoggerManager.GetLogger(apiKey, this.GetType().Name);
                else if (this.Logger == null)
                    this.Logger = AMWLoggerManager.GetLogger("notkey", this.GetType().Name);

                this.Logger.LogInfo("####### START TRANSACTION #######");
                this.Logger.LogInfo("REQUEST_DATA:: " + ObjectUtil.Json(request));
                this.BuVO.Set(BusinessVOConst.KEY_RESULT_API, result);
                this.BuVO.Set(BusinessVOConst.KEY_REQUEST, request);
                this.Permission(token,apiKey, APIServiceID());

                this.BuVO.Set(BusinessVOConst.KEY_LOGGER, this.Logger);
                dbLogID = ADO.LogingADO.GetInstant().BeginAPIService(
                    this.APIServiceID(),
                    this.GetType().Name,
                    this.ControllerAPI == null ? string.Empty : this.ControllerAPI.HttpContext.Request.Headers["Referer"].ToString(),
                    this.ControllerAPI == null ? string.Empty : this.ControllerAPI.HttpContext.Connection.RemoteIpAddress.ToString(),
                    this.ControllerAPI == null ? string.Empty : this.ControllerAPI.HttpContext.Connection.LocalIpAddress.ToString(),
                    System.Environment.MachineName,
                    this.RequestVO,
                    this.BuVO);
                this.BuVO.Set(BusinessVOConst.KEY_DB_LOGID, dbLogID);

                
                var res = this.ExecuteEngineManual();

                var resAPI = new ResponseObject().Execute(this.Logger, this.BuVO, res);
                result.status = 1;
                result.code = AMWExceptionCode.I0000.ToString();
                result.message = "Success";
                result.stacktrace = string.Empty;
                this.CommitTransaction();
            }
            catch (AMWException ex)
            {
                result.status = 0;
                result.code = ex.GetAMWCode();
                result.message = ex.GetAMWMessage();
                result.stacktrace = ex.StackTrace;
                this.RollbackTransaction();
            }
            catch (Exception ex)
            {
                var e = new AMWException(this.Logger, AMWExceptionCode.U0000, ex.Message);
                result.status = 0;
                result.code = e.GetAMWCode();
                result.message = e.GetAMWMessage();
                result.stacktrace = ex.StackTrace;
                this.Logger.LogError(ex.StackTrace);
                this.RollbackTransaction();
            }
            finally
            {
                this.RollbackTransaction();
                response = this.BuVO.GetDynamic(BusinessVOConst.KEY_RESPONSE);
                if (response == null)
                {
                    response = new { _result = this.BuVO.GetDynamic(BusinessVOConst.KEY_RESULT_API) };
                }

                int _status = result.status;
                string _code = result.code;
                string _message = result.message;
                string _stacktrace = result.stacktrace;
                if (!string.IsNullOrEmpty(apiKey))
                    result.stacktrace = null;

                ADO.LogingADO.GetInstant().EndAPIService(dbLogID, _status, _code, _message, _stacktrace, this.BuVO);
                this.Logger.LogInfo("RESPONSE_DATA:: " + ObjectUtil.Json(response));
                this.Logger.LogInfo("####### END TRANSACTION #######");
            }
            return response;
        }

        //private void Permission(string token, string apiKey, int APIServiceID)
        //{
        //    throw new NotImplementedException();
        //}


        private void Permission(string token, string apiKey,int APIServiceID)
        {
            var tokenInfo = !string.IsNullOrEmpty(token) ? ADO.DataADO.GetInstant().SelectBy<amt_Token>("token", token, this.BuVO).FirstOrDefault() : null;
            this.BuVO.Set(BusinessVOConst.KEY_TOKEN_INFO, tokenInfo);
            this.BuVO.Set(BusinessVOConst.KEY_TOKEN, token);
            this.Logger.LogInfo("TOKEN:: " + token);

            var apiKeyInfo = !string.IsNullOrEmpty(apiKey) ? ADO.DataADO.GetInstant().SelectBy<ams_APIKey>("APIKey", apiKey, this.BuVO).FirstOrDefault() : null;
            this.BuVO.Set(BusinessVOConst.KEY_APIKEY_INFO, apiKeyInfo);
            this.BuVO.Set(BusinessVOConst.KEY_APIKEY, apiKey);
            this.Logger.LogInfo("APIKEY:: " + apiKey);

            if (!this.IsAuthenAuthorize)
                return;


            ADO.TokenADO.GetInstant().Authen(token, apiKey,APIServiceID, this.BuVO);
             
            
          

            if (!string.IsNullOrEmpty(apiKey) && apiKeyInfo == null)
                throw new AMWException(this.Logger, AMWExceptionCode.A0001, "API Key Not Found");
            if (!string.IsNullOrEmpty(token) && tokenInfo == null)
                throw new AMWException(this.Logger, AMWExceptionCode.A0001, "Token Not Found");
            if (tokenInfo == null && apiKeyInfo == null)
                throw new AMWException(this.Logger, AMWExceptionCode.A0001, "Key Not Found");

            if (tokenInfo != null)
            {
                if (DateTime.Now > tokenInfo.ExpireTime)
                    throw new AMWException(this.Logger, AMWExceptionCode.A0001, "Token Expire");
                

            }
        }
    }
}
