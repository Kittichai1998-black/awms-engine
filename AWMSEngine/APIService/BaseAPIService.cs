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
        public int APIServiceID() { return 0; }
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



        public dynamic Execute(dynamic request)
        {
            this.BuVO = new VOCriteria();
            dynamic response = new { };
            dynamic result = new ExpandoObject();
            long dbLogID = 0;
            try
            {
                var getKey = ObjectUtil.QueryStringToObject(this.ControllerAPI.Request.QueryString.Value);
                string token = null;
                string apiKey = null;
                try
                {
                    if (getKey._apiKey != null)
                        apiKey = getKey._apiKey;
                    if(request != null)
                    {
                        if (request._apiKey != null)
                            apiKey = request._apiKey;
                    }
                    if (!string.IsNullOrWhiteSpace(apiKey))
                    {
                        this.Logger = AMWLoggerManager.GetLogger(apiKey, this.GetType().Name);
                    }
                    else
                    {
                        apiKey = null;
                    }
                    if (getKey._token != null)
                        token = getKey._token;
                    if (request != null)
                    {
                        if (request._token != null)
                            token = request._token;
                    }
                    if (!string.IsNullOrWhiteSpace(token))
                    {
                        this.Logger = AMWLoggerManager.GetLogger(token, this.GetType().Name);
                    }
                    else
                    {
                        token = null;
                    }
                }
                catch{
                    this.Logger = AMWLoggerManager.GetLogger("notkey", this.GetType().Name);
                }
                if(this.Logger == null)
                    this.Logger = AMWLoggerManager.GetLogger("notkey", this.GetType().Name);


                this.Logger.LogBegin();
                this.BuVO.Set(BusinessVOConst.KEY_RESULT_API, result);

                this.BuVO.Set(BusinessVOConst.KEY_REQUEST, request);
                this.Logger.LogInfo("request : " + ObjectUtil.Json(request));
                this.Permission(token, apiKey);

                this.BuVO.Set(BusinessVOConst.KEY_LOGGER, this.Logger);
                dbLogID = ADO.LogingADO.GetInstant().BeginAPIService(
                    this.APIServiceID(),
                    this.ControllerAPI.HttpContext.Request.Headers["Referer"].ToString(),
                    this.ControllerAPI.HttpContext.Connection.RemoteIpAddress.ToString(),
                    this.ControllerAPI.HttpContext.Connection.LocalIpAddress.ToString(),
                    System.Environment.MachineName,
                    this.RequestVO,
                    this.BuVO);
                this.BuVO.Set(BusinessVOConst.KEY_DB_LOGID, dbLogID);


                this.Logger.LogInfo("[BeginExecuteEngineManual]");
                var res = this.ExecuteEngineManual();
                this.Logger.LogInfo("[EndExecuteEngineManual]");
                //if (res == null)
                //    throw new AMWException(this.Logger, AMWExceptionCode.V3001, "Response API");
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
                this.Logger.LogInfo("API Response : " + ObjectUtil.Json(response));
                this.Logger.LogEnd();
                int _status = result.status;
                string _code = result.code;
                string _message = result.message;
                string _stacktrace = result.stacktrace;
                ADO.LogingADO.GetInstant().EndAPIService(dbLogID, _status, _code, _message, _stacktrace, this.BuVO);
            }
            return response;
        }

        private void Permission(string token, string apiKey)
        {
            var tokenInfo = !string.IsNullOrEmpty(token) ? ADO.DataADO.GetInstant().SelectBy<amt_Token>("token", token, this.BuVO).FirstOrDefault() : null;
            this.BuVO.Set(BusinessVOConst.KEY_TOKEN_INFO, tokenInfo);
            this.BuVO.Set(BusinessVOConst.KEY_TOKEN, token);
            this.Logger.LogInfo("token : " + token);

            var apiKeyInfo = !string.IsNullOrEmpty(apiKey) ? ADO.DataADO.GetInstant().SelectBy<ams_APIKey>("code", apiKey, this.BuVO).FirstOrDefault() : null;
            this.BuVO.Set(BusinessVOConst.KEY_APIKEY_INFO, apiKeyInfo);
            this.BuVO.Set(BusinessVOConst.KEY_APIKEY, apiKeyInfo);
            this.Logger.LogInfo("apikey : " + apiKey);

            if (!this.IsAuthenAuthorize)
                return;

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
